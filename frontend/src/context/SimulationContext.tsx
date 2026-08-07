import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { loadAllData } from '../utils/csvLoader';
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
const TOTAL_TICKS = 1000;

interface SimContextValue {
  state: SimulationState;
  controls: SimulationControls;
  events: SimulationEvent[];
  selectedNode: SelectedNode | null;
  setSelectedNode: (node: SelectedNode | null) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  isLoading: boolean;
}

const SimulationContext = createContext<SimContextValue | null>(null);

export function useSimulation(): SimContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be inside SimulationProvider');
  return ctx;
}

function groupByTick<T extends { timestamp?: string }>(
  data: T[],
  idField: string,
  totalTicks: number
): Map<string, T>[] {
  const tickMaps: Map<string, T>[] = [];
  const idSet = new Set<string>();
  data.forEach((row) => idSet.add((row as Record<string, unknown>)[idField] as string));
  const ids = Array.from(idSet);
  const rowsPerTick = Math.ceil(data.length / totalTicks);

  for (let tick = 0; tick < totalTicks; tick++) {
    const map = new Map<string, T>();
    if (tick > 0 && tickMaps[tick - 1]) {
      tickMaps[tick - 1].forEach((v, k) => map.set(k, v));
    }
    const startIdx = tick * rowsPerTick;
    const endIdx = Math.min(startIdx + rowsPerTick, data.length);
    for (let i = startIdx; i < endIdx; i++) {
      const row = data[i];
      const id = (row as Record<string, unknown>)[idField] as string;
      map.set(id, row);
    }
    if (tick === 0) {
      ids.forEach((id) => {
        if (!map.has(id)) {
          const firstRow = data.find(
            (r) => (r as Record<string, unknown>)[idField] === id
          );
          if (firstRow) map.set(id, firstRow);
        }
      });
    }
    tickMaps.push(map);
  }
  return tickMaps;
}

function groupFailuresByTick(
  data: TowerFailureRow[],
  totalTicks: number
): Map<string, TowerFailureRow>[] {
  const tickMaps: Map<string, TowerFailureRow>[] = [];
  const rowsPerTick = Math.ceil(data.length / totalTicks);

  for (let tick = 0; tick < totalTicks; tick++) {
    const map = new Map<string, TowerFailureRow>();
    if (tick > 0 && tickMaps[tick - 1]) {
      tickMaps[tick - 1].forEach((v, k) => map.set(k, v));
    }
    const startIdx = tick * rowsPerTick;
    const endIdx = Math.min(startIdx + rowsPerTick, data.length);
    for (let i = startIdx; i < endIdx; i++) {
      const row = data[i];
      map.set(row.tower_id, row);
    }
    tickMaps.push(map);
  }
  return tickMaps;
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
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    loadAllData().then((raw) => {
      nodesRef.current = raw.networkNodes;
      healthTicks.current = raw.networkHealth;
      towerTicks.current = groupByTick<TowerUtilizationRow>(raw.towerUtil, 'tower_id', TOTAL_TICKS);
      trafficTicks.current = groupByTick<TrafficProfileRow>(raw.trafficProfile, 'tower_id', TOTAL_TICKS);
      edgeTicks.current = groupByTick<EdgeServerRow>(raw.edgeServers, 'edge_id', TOTAL_TICKS);
      failureTicks.current = groupFailuresByTick(raw.towerFailures, TOTAL_TICKS);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (isPlaying && !isLoading) {
      intervalRef.current = setInterval(() => {
        setCurrentTick((prev) => {
          if (prev >= TOTAL_TICKS - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, 1000 / speedRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, isLoading, speed]);

  useEffect(() => {
    if (isLoading) return;
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
  }, [currentTick, isLoading]);

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

  const historyStart = Math.max(0, tick - MAX_HISTORY);
  const healthHistory = healthTicks.current.slice(historyStart, tick + 1);
  const towerHistory = new Map<string, TowerUtilizationRow[]>();
  for (let i = historyStart; i <= tick; i++) {
    const m = towerTicks.current[i];
    if (m) m.forEach((v, k) => { if (!towerHistory.has(k)) towerHistory.set(k, []); towerHistory.get(k)!.push(v); });
  }
  const edgeHistory = new Map<string, EdgeServerRow[]>();
  for (let i = historyStart; i <= tick; i++) {
    const m = edgeTicks.current[i];
    if (m) m.forEach((v, k) => { if (!edgeHistory.has(k)) edgeHistory.set(k, []); edgeHistory.get(k)!.push(v); });
  }
  const trafficHistory: TrafficProfileRow[] = [];
  for (let i = historyStart; i <= tick; i++) {
    const m = trafficTicks.current[i];
    if (m) m.forEach((v) => trafficHistory.push(v));
  }

  const firstTower = towerData.values().next().value;
  const timestamp = firstTower?.timestamp || '2026-01-01 00:00:00';

  const state: SimulationState = {
    currentTick: tick, isPlaying, speed, timestamp,
    towerData, trafficData, failureData, edgeData, healthData,
    nodes: nodesRef.current, healthHistory, towerHistory, edgeHistory, trafficHistory,
  };
  const controls: SimulationControls = { play, pause, reset, setSpeed, seekTo };

  return (
    <SimulationContext.Provider value={{ state, controls, events, selectedNode, setSelectedNode, filters, setFilters, isLoading }}>
      {children}
    </SimulationContext.Provider>
  );
};
