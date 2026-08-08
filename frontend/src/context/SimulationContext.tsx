import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { getTowers, getEdges, getTowerUtilization, getTowerTraffic, getTowerFailures, getEdgeTelemetry, getNetworkHealth } from '../services/api/network';
import { getSnapshotHistory } from '../services/api/snapshots';
import { useWebSocket } from '../hooks/useWebSocket';
import { WS_BASE_URL } from '../services/api/client';
import {
  adaptTowerUtilization, adaptTraffic, adaptFailure, adaptEdgeTelemetry, adaptNetworkHealth, adaptNodes,
} from '../services/adapters/telemetryAdapter';
import {
  adaptExecutionReport, adaptPrediction, adaptStrategies, strategyToQueuedDecision,
  adaptScenarioMetadata, adaptInsight,
} from '../services/adapters/aiLoopAdapter';
import type { AiDecisionItem, PredictionSummary, StrategySummary, AlertItem, AssistantInsight } from '../services/adapters/aiLoopAdapter';
import { TOWER_IDS, EDGE_IDS } from '../utils/topology';
import type { NetworkWsMessage, NetworkSnapshotResponse, BackendTelemetryState } from '../types/backend';
import type { WsStatus } from '../services/websocket/websocket';
import type {
  TowerUtilizationRow,
  TrafficProfileRow,
  TowerFailureRow,
  EdgeServerRow,
  NetworkHealthRow,
  NetworkNodeRow,
  SimulationState,
  SimulationControls,
  SimulationEvent,
  SelectedNode,
  FilterState,
} from '../types';

const MAX_HISTORY = 60;
export const TOTAL_TICKS = 1000;
const SECONDS_PER_DAY = 86400;
/** Scenario-derived alerts have no "resolved" signal from the backend (it's a one-shot event
 * marker, not persistent state) — they auto-expire client-side after this long. */
const ALERT_TTL_MS = 120_000;

interface SimContextValue {
  state: SimulationState;
  controls: SimulationControls;
  events: SimulationEvent[];
  selectedNode: SelectedNode | null;
  setSelectedNode: (node: SelectedNode | null) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  isLoading: boolean;
  /** WebSocket connection status for the AI decision-loop layer. */
  connectionStatus: WsStatus;
  aiDecisions: AiDecisionItem[];
  prediction: PredictionSummary | null;
  strategies: StrategySummary | null;
  telemetry: BackendTelemetryState | null;
  alerts: AlertItem[];
  assistantInsight: AssistantInsight | null;
  isReplaying: boolean;
  isReplayLoading: boolean;
  replaySnapshotCount: number;
  enterReplay: () => void;
  exitReplay: () => void;
  /** Downsampled fleet-wide latency/bandwidth series for the Simulation Replay chart. */
  dailySeries: DailyPoint[];
}

export interface DailyPoint {
  hour: number;
  latency: number;
  bandwidth: number;
}

const SimulationContext = createContext<SimContextValue | null>(null);

export function useSimulation(): SimContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be inside SimulationProvider');
  return ctx;
}

/** Scales a chronological row array onto exactly `totalTicks` slots (nearest-floor lookup) —
 * handles the fact that each tower/edge/health series has a different real row count. */
function scaleToTicks<T>(rows: T[], totalTicks: number): T[] {
  if (rows.length === 0) return [];
  const out: T[] = Array.from({ length: totalTicks });
  const lastIdx = rows.length - 1;
  for (let tick = 0; tick < totalTicks; tick++) {
    const idx = lastIdx === 0 ? 0 : Math.min(lastIdx, Math.floor((tick / (totalTicks - 1)) * lastIdx));
    out[tick] = rows[idx];
  }
  return out;
}

/** Builds the same `Map<string, Row>[]` shape the dashboard already consumes, one map per tick,
 * from multiple entities (towers/edges) each independently scaled onto the tick range. */
function buildEntityTickMaps<T>(
  entities: { id: string; rows: T[] }[],
  totalTicks: number
): Map<string, T>[] {
  const scaled = entities.map((e) => ({ id: e.id, rows: scaleToTicks(e.rows, totalTicks) }));
  const out: Map<string, T>[] = Array.from({ length: totalTicks });
  for (let tick = 0; tick < totalTicks; tick++) {
    const map = new Map<string, T>();
    scaled.forEach(({ id, rows }) => {
      if (rows[tick] !== undefined) map.set(id, rows[tick]);
    });
    out[tick] = map;
  }
  return out;
}

function generateEvents(
  tick: number,
  towerData: Map<string, TowerUtilizationRow>,
  failureData: Map<string, TowerFailureRow>,
  healthData: NetworkHealthRow | null,
  prevFailures: Set<string>
): SimulationEvent[] {
  const events: SimulationEvent[] = [];
  const ts = `${String(Math.floor(tick / 60) % 24).padStart(2, '0')}:${String(tick % 60).padStart(2, '0')}`;

  towerData.forEach((tower, towerId) => {
    const utilization = 100 - tower.available_bandwidth_mbps;
    if (utilization > 85) {
      events.push({
        id: `${tick}-spike-${towerId}`,
        timestamp: ts,
        message: `Traffic Spike on ${towerId} — Utilization ${utilization.toFixed(0)}%`,
        severity: 'warning',
        nodeId: towerId,
      });
    }
    if (tower.latency_ms > 30) {
      events.push({
        id: `${tick}-latency-${towerId}`,
        timestamp: ts,
        message: `High Latency on ${towerId}: ${tower.latency_ms.toFixed(1)}ms`,
        severity: 'warning',
        nodeId: towerId,
      });
    }
  });

  failureData.forEach((failure, towerId) => {
    if (failure.failed === 1 && !prevFailures.has(towerId)) {
      events.push({
        id: `${tick}-failure-${towerId}`,
        timestamp: ts,
        message: `⚠ Tower Failure Detected: ${towerId} — ${failure.weather} conditions`,
        severity: 'critical',
        nodeId: towerId,
      });
      events.push({
        id: `${tick}-reroute-${towerId}`,
        timestamp: ts,
        message: `AI Rerouting traffic from ${towerId} to adjacent towers`,
        severity: 'info',
        nodeId: towerId,
      });
    } else if (failure.failed === 0 && prevFailures.has(towerId)) {
      events.push({
        id: `${tick}-recover-${towerId}`,
        timestamp: ts,
        message: `✓ ${towerId} recovered — Network Healthy`,
        severity: 'success',
        nodeId: towerId,
      });
    }
  });

  if (healthData && healthData.network_health_score < 40) {
    events.push({
      id: `${tick}-health-low`,
      timestamp: ts,
      message: `Network Health Critical: ${healthData.network_health_score.toFixed(1)}`,
      severity: 'critical',
    });
  }

  return events;
}

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fleetLoading, setFleetLoading] = useState(true);
  const [dailySeries, setDailySeries] = useState<DailyPoint[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [currentTick, setCurrentTick] = useState(0);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    towers: true, users: true, edges: true, critical: true, traffic: true, failures: true,
  });

  const towerTicks = useRef<Map<string, TowerUtilizationRow>[]>([]);
  const trafficTicks = useRef<Map<string, TrafficProfileRow>[]>([]);
  const failureTicks = useRef<Map<string, TowerFailureRow>[]>([]);
  const edgeTicks = useRef<Map<string, EdgeServerRow>[]>([]);
  const healthTicks = useRef<NetworkHealthRow[]>([]);
  const nodesRef = useRef<NetworkNodeRow[]>([]);
  const prevFailures = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  // ── Fleet / Digital Twin layer — fetched once from the real per-tower/edge REST endpoints,
  // then replayed through the tick engine below exactly like the old mock CSVs were. ─────────
  useEffect(() => {
    let cancelled = false;

    async function loadFleet() {
      try {
        const [towersRes, edgesRes] = await Promise.all([
          getTowers(0, TOWER_IDS.length),
          getEdges(0, EDGE_IDS.length),
        ]);

        const towerSeries = await Promise.all(TOWER_IDS.map(async (id) => {
          const [util, traffic, failures] = await Promise.all([
            getTowerUtilization(id, 0, 1000).catch(() => []),
            getTowerTraffic(id, 0, 1000).catch(() => []),
            getTowerFailures(id, 0, 1000).catch(() => []),
          ]);
          return {
            id,
            // Backend orders utilization/traffic newest-first — reverse to chronological so
            // tick 0 = earliest, matching the tick engine's existing convention.
            util: util.map(adaptTowerUtilization).reverse(),
            traffic: traffic.map(adaptTraffic).reverse(),
            // Failures carry no timestamp/order guarantee from the backend — used as returned.
            failures: failures.map(adaptFailure),
          };
        }));

        const edgeSeries = await Promise.all(EDGE_IDS.map(async (id) => {
          const telemetry = await getEdgeTelemetry(id, 0, 1000).catch(() => []);
          return { id, telemetry: telemetry.map(adaptEdgeTelemetry).reverse() };
        }));

        const healthRes = await getNetworkHealth(0, 1000).catch(() => []);
        const healthRows = healthRes.map(adaptNetworkHealth).reverse();

        if (cancelled) return;

        nodesRef.current = adaptNodes(towersRes, edgesRes);
        healthTicks.current = scaleToTicks(healthRows, TOTAL_TICKS);
        towerTicks.current = buildEntityTickMaps(towerSeries.map((t) => ({ id: t.id, rows: t.util })), TOTAL_TICKS);
        trafficTicks.current = buildEntityTickMaps(towerSeries.map((t) => ({ id: t.id, rows: t.traffic })), TOTAL_TICKS);
        failureTicks.current = buildEntityTickMaps(towerSeries.map((t) => ({ id: t.id, rows: t.failures })), TOTAL_TICKS);
        edgeTicks.current = buildEntityTickMaps(edgeSeries.map((e) => ({ id: e.id, rows: e.telemetry })), TOTAL_TICKS);

        // Downsampled latency/bandwidth series for the Simulation Replay chart — computed once
        // from the same fleet arrays above, not a separate fetch or timer.
        const SAMPLE_COUNT = 100;
        const series: DailyPoint[] = [];
        for (let i = 0; i < SAMPLE_COUNT; i++) {
          const sampleTick = Math.floor((i / (SAMPLE_COUNT - 1)) * (TOTAL_TICKS - 1));
          const health = healthTicks.current[sampleTick];
          const towersAtTick = towerTicks.current[sampleTick];
          let bandwidth = 0;
          if (towersAtTick && towersAtTick.size > 0) {
            let sum = 0;
            towersAtTick.forEach((t) => { sum += t.available_bandwidth_mbps; });
            bandwidth = sum / towersAtTick.size;
          }
          series.push({ hour: (i / SAMPLE_COUNT) * 24, latency: health?.latency_ms ?? 0, bandwidth });
        }
        setDailySeries(series);
      } catch {
        // services/api/client.ts already raised a toast — don't let a fleet-load failure
        // block the dashboard forever.
      } finally {
        if (!cancelled) setFleetLoading(false);
      }
    }

    loadFleet();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (isPlaying && !fleetLoading) {
      intervalRef.current = setInterval(() => {
        setCurrentTick((prev) => {
          if (prev >= TOTAL_TICKS - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, 1000 / speedRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, fleetLoading, speed]);

  useEffect(() => {
    if (fleetLoading) return;
    const tick = currentTick;
    const tData = towerTicks.current[tick] || new Map();
    const fData = failureTicks.current[tick] || new Map();
    const hData = healthTicks.current[tick] || null;
    const newEvents = generateEvents(tick, tData, fData, hData, prevFailures.current);
    const currentFailedSet = new Set<string>();
    fData.forEach((f, id) => { if (f.failed === 1) currentFailedSet.add(id); });
    prevFailures.current = currentFailedSet;
    if (newEvents.length > 0) {
      setEvents((prev) => [...prev.slice(-200), ...newEvents]);
    }
  }, [currentTick, fleetLoading]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const reset = useCallback(() => { setIsPlaying(false); setCurrentTick(0); setEvents([]); prevFailures.current = new Set(); }, []);
  const setSpeed = useCallback((s: number) => setSpeedState(s), []);
  const seekTo = useCallback((tick: number) => setCurrentTick(Math.max(0, Math.min(tick, TOTAL_TICKS - 1))), []);

  const tick = currentTick;
  const towerData = towerTicks.current[tick] || new Map();
  const trafficData = trafficTicks.current[tick] || new Map();
  const failureData = failureTicks.current[tick] || new Map();
  const edgeData = edgeTicks.current[tick] || new Map();
  const healthData = healthTicks.current[tick] || null;

  const historyStart = Math.max(0, currentTick - MAX_HISTORY);
  const healthHistory = healthTicks.current.slice(historyStart, currentTick + 1);
  const towerHistory = new Map<string, TowerUtilizationRow[]>();
  for (let i = historyStart; i <= currentTick; i++) {
    const m = towerTicks.current[i];
    if (m) m.forEach((v, k) => { if (!towerHistory.has(k)) towerHistory.set(k, []); towerHistory.get(k)!.push(v); });
  }
  const edgeHistory = new Map<string, EdgeServerRow[]>();
  for (let i = historyStart; i <= currentTick; i++) {
    const m = edgeTicks.current[i];
    if (m) m.forEach((v, k) => { if (!edgeHistory.has(k)) edgeHistory.set(k, []); edgeHistory.get(k)!.push(v); });
  }
  const trafficHistory: TrafficProfileRow[] = [];
  for (let i = historyStart; i <= currentTick; i++) {
    const m = trafficTicks.current[i];
    if (m) m.forEach((v) => trafficHistory.push(v));
  }

  // Continuously-interpolated 24h clock, independent of the fleet's real (coarser) sample
  // spacing, so the header/replay timestamp always moves smoothly across the tick range.
  const simSeconds = Math.floor((currentTick / (TOTAL_TICKS - 1)) * SECONDS_PER_DAY);
  const clockStr = [
    Math.floor(simSeconds / 3600) % 24,
    Math.floor(simSeconds / 60) % 60,
    simSeconds % 60,
  ].map((n) => String(n).padStart(2, '0')).join(':');
  const timestamp = `2026-01-01 ${clockStr}`;

  const state: SimulationState = {
    currentTick, isPlaying, speed, timestamp,
    towerData, trafficData, failureData, edgeData, healthData,
    nodes: nodesRef.current, healthHistory, towerHistory, edgeHistory, trafficHistory,
  };
  const controls: SimulationControls = { play, pause, reset, setSpeed, seekTo };

  // ── AI decision-loop layer — live WebSocket, single aggregate simulated entity. ────────────
  const { status: connectionStatus, lastMessage } = useWebSocket(`${WS_BASE_URL}/ws/network`);

  const [hasReceivedFirstFrame, setHasReceivedFirstFrame] = useState(false);
  const [aiDecisions, setAiDecisions] = useState<AiDecisionItem[]>([]);
  const [prediction, setPrediction] = useState<PredictionSummary | null>(null);
  const [strategies, setStrategies] = useState<StrategySummary | null>(null);
  const [telemetry, setTelemetry] = useState<BackendTelemetryState | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [assistantInsight, setAssistantInsight] = useState<AssistantInsight | null>(null);

  const [isReplaying, setIsReplaying] = useState(false);
  const [isReplayLoading, setIsReplayLoading] = useState(false);
  const [replaySnapshots, setReplaySnapshots] = useState<NetworkSnapshotResponse[]>([]);

  useEffect(() => {
    if (isReplaying || !lastMessage || typeof lastMessage !== 'object') return;
    const msg = lastMessage as NetworkWsMessage;
    if (!('telemetry' in msg) || !('prediction' in msg)) return; // guard malformed frames

    setHasReceivedFirstFrame(true);
    setTelemetry(msg.telemetry);
    setPrediction(adaptPrediction(msg.prediction));
    const stratSummary = adaptStrategies(msg.strategies);
    setStrategies(stratSummary);
    setAssistantInsight(adaptInsight(msg.explainability, msg.timestamp));

    setAiDecisions((prev) => {
      const liveItem = adaptExecutionReport(msg.execution, msg.id);
      const queuedItem = stratSummary.topCandidate ? strategyToQueuedDecision(stratSummary.topCandidate) : null;
      const rest = prev.filter((d) => d.id !== liveItem.id && d.id !== queuedItem?.id);
      return [liveItem, ...(queuedItem ? [queuedItem] : []), ...rest].slice(0, 20);
    });

    const now = Date.now();
    setAlerts((prev) => {
      const fresh = prev.filter((a) => now - new Date(a.detectedAt).getTime() < ALERT_TTL_MS);
      if (!msg.scenario) return fresh;
      const alert = adaptScenarioMetadata(msg.scenario);
      return [alert, ...fresh.filter((a) => a.id !== alert.id)].slice(0, 20);
    });
  }, [lastMessage, isReplaying]);

  const enterReplay = useCallback(() => {
    setIsReplayLoading(true);
    getSnapshotHistory(100)
      .then((history) => {
        // Backend returns newest-first — reverse to chronological to match the tick engine.
        setReplaySnapshots([...history].reverse());
        setIsReplaying(true);
      })
      .catch(() => {
        // client.ts already raised a toast — stay in live mode.
      })
      .finally(() => setIsReplayLoading(false));
  }, []);

  const exitReplay = useCallback(() => setIsReplaying(false), []);

  let effectivePrediction = prediction;
  let effectiveStrategies = strategies;
  let effectiveTelemetry = telemetry;
  if (isReplaying && replaySnapshots.length > 0) {
    const lastIdx = replaySnapshots.length - 1;
    const snapIdx = lastIdx === 0 ? 0 : Math.min(lastIdx, Math.floor((currentTick / (TOTAL_TICKS - 1)) * lastIdx));
    const snapshot = replaySnapshots[snapIdx];
    effectiveTelemetry = snapshot.telemetry;
    effectivePrediction = adaptPrediction(snapshot.prediction);
    effectiveStrategies = adaptStrategies(snapshot.strategies);
  }

  const isLoading = fleetLoading || !hasReceivedFirstFrame;

  return (
    <SimulationContext.Provider value={{
      state, controls, events, selectedNode, setSelectedNode, filters, setFilters, isLoading,
      connectionStatus,
      aiDecisions, prediction: effectivePrediction, strategies: effectiveStrategies, telemetry: effectiveTelemetry, alerts, assistantInsight,
      isReplaying, isReplayLoading, replaySnapshotCount: replaySnapshots.length, enterReplay, exitReplay,
      dailySeries,
    }}>
      {children}
    </SimulationContext.Provider>
  );
};
