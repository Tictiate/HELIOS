import { TOWER_IDS, EDGE_IDS } from '../../utils/topology';
import type { NetworkHealthRow, TowerUtilizationRow, TowerFailureRow, EdgeServerRow } from '../../types';

/**
 * Frontend-only mock replay data for the 24-hour Simulation Replay timeline. Not derived from
 * the real CSV datasets and never touches backend/API logic — a full day of procedurally
 * generated frames (diurnal load curve + one scripted incident) used to drive the whole
 * dashboard's unified playback. Future backend APIs should simply replace this module's frames.
 */
export interface MockAlert {
  towerId: string;
  severity: 'critical' | 'warning';
  message: string;
}

export interface MockFrame {
  id: string;
  /** Short label, e.g. "14:30" */
  label: string;
  /** Full timestamp string, matching the shape SimulationContext already produces */
  timestamp: string;
  /** Synthetic tick number mapped into the live simulation's 0-999 range */
  tickIndex: number;
  hour: number;
  healthData: NetworkHealthRow;
  towerData: Map<string, TowerUtilizationRow>;
  failureData: Map<string, TowerFailureRow>;
  edgeData: Map<string, EdgeServerRow>;
  alerts: MockAlert[];
  avgLatencyMs: number;
  avgBandwidthMbps: number;
}

const FRAME_COUNT = 96; // 24h at 15-minute steps
const TOTAL_TICKS = 1000;

interface ScriptedIncident {
  tower: string;
  startHour: number;
  endHour: number;
  /** Elevated/"recovering" weather state lingers a bit past endHour before fully clearing. */
  weatherEndHour: number;
  weather: string;
}

// Several deterministic incidents spread across the day — so scrubbing/playing through any part
// of the 24h replay shows the topology and Alerts & Incidents feed actively changing, not just
// one narrow window.
const SCRIPTED_INCIDENTS: ScriptedIncident[] = [
  { tower: 'T2', startHour: 6.25, endHour: 6.75, weatherEndHour: 7.25, weather: 'fog' },
  { tower: 'T8', startHour: 10.75, endHour: 11.25, weatherEndHour: 11.75, weather: 'clear' },
  { tower: 'T5', startHour: 14.25, endHour: 15.0, weatherEndHour: 15.5, weather: 'storm' },
  { tower: 'T3', startHour: 19.25, endHour: 19.75, weatherEndHour: 20.25, weather: 'storm' },
];

function activeIncidentAt(hour: number): ScriptedIncident | null {
  return SCRIPTED_INCIDENTS.find((inc) => hour >= inc.startHour && hour < inc.endHour) ?? null;
}
function weatherIncidentAt(hour: number): ScriptedIncident | null {
  return SCRIPTED_INCIDENTS.find((inc) => hour >= inc.startHour && hour < inc.weatherEndHour) ?? null;
}

/** Two overlapping bells (morning + afternoon/evening rush) — drives the diurnal load curve. */
function loadFactor(hour: number): number {
  const morning = Math.exp(-((hour - 8.5) ** 2) / (2 * 2.2 ** 2)) * 0.65;
  const afternoon = Math.exp(-((hour - 14.5) ** 2) / (2 * 3.2 ** 2));
  const evening = Math.exp(-((hour - 19.5) ** 2) / (2 * 1.8 ** 2)) * 0.55;
  return Math.min(1, morning + afternoon + evening);
}

function formatClock(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function buildFrame(frameIndex: number): MockFrame {
  const hour = (frameIndex / FRAME_COUNT) * 24;
  const label = formatClock(hour);
  const timestamp = `2026-01-01 ${label}:00`;
  const tickIndex = Math.round((frameIndex / (FRAME_COUNT - 1)) * (TOTAL_TICKS - 1));

  const load = loadFactor(hour);
  const incident = activeIncidentAt(hour);
  const weatherIncident = weatherIncidentAt(hour);
  const incidentActive = incident !== null;

  const healthScore = Math.round(90 - load * 47 - (incidentActive ? 18 : 0));
  const latencyMs = Math.round((10 + load * 32 + (incidentActive ? 22 : 0)) * 10) / 10;
  const packetLossPct = Math.round((0.2 + load * 3.2 + (incidentActive ? 2.5 : 0)) * 100) / 100;
  const availabilityPct = Math.round((99.85 - load * 6.5 - (incidentActive ? 6 : 0)) * 100) / 100;
  const energyUsagePct = Math.round(45 + load * 32);

  const towerRows: TowerUtilizationRow[] = TOWER_IDS.map((towerId, i) => {
    const isFailing = incident !== null && towerId === incident.tower;
    const wobble = Math.sin(frameIndex * 0.35 + i * 0.9) * 6;
    const baseBandwidth = isFailing ? 3 : Math.max(8, 66 - load * 52 + wobble);
    return {
      timestamp,
      tower_id: towerId,
      users: Math.round(300 + load * 900 + wobble * 25 + (isFailing ? -280 : 0) + i * 20),
      available_bandwidth_mbps: Math.round(baseBandwidth * 10) / 10,
      latency_ms: Math.round((isFailing ? latencyMs * 2.2 : latencyMs + wobble * 0.5) * 10) / 10,
      packet_loss_pct: Math.round((isFailing ? packetLossPct * 2.8 : packetLossPct + Math.abs(wobble) * 0.04) * 100) / 100,
      power_usage_pct: Math.round(Math.min(98, energyUsagePct + wobble)),
      temperature_c: Math.round((isFailing ? 59 : 32 + load * 10 + wobble * 0.4) * 10) / 10,
    };
  });

  const failureRows: TowerFailureRow[] = TOWER_IDS.map((towerId) => {
    const isFailing = incident !== null && towerId === incident.tower;
    const isWeatherLinger = weatherIncident !== null && towerId === weatherIncident.tower;
    return {
      tower_id: towerId,
      temperature_c: isFailing ? 61 : 33,
      power_usage_pct: isFailing ? 95 : energyUsagePct,
      traffic_load: isFailing ? 97 : Math.round(40 + load * 50),
      weather: isWeatherLinger ? weatherIncident!.weather : 'clear',
      cpu_usage_pct: isFailing ? 92 : Math.round(35 + load * 40),
      failed: isFailing ? 1 : 0,
    };
  });

  const edgeRows: EdgeServerRow[] = EDGE_IDS.map((edgeId, i) => {
    const wobble = Math.sin(frameIndex * 0.28 + i * 1.1) * 7;
    return {
      timestamp,
      edge_id: edgeId,
      cpu_pct: Math.round(Math.min(97, Math.max(10, 22 + load * 52 + wobble + (incidentActive ? 12 : 0)))),
      gpu_pct: Math.round(Math.min(96, Math.max(8, 18 + load * 46 + wobble))),
      memory_pct: Math.round(Math.min(96, Math.max(15, 32 + load * 40 + wobble * 0.6))),
      requests_per_min: Math.round(1200 + load * 3800 + wobble * 100),
      latency_ms: Math.round((4 + load * 8 + Math.abs(wobble) * 0.2) * 10) / 10,
    };
  });

  const healthData: NetworkHealthRow = {
    latency_ms: latencyMs,
    packet_loss_pct: packetLossPct,
    availability_pct: availabilityPct,
    energy_usage_pct: energyUsagePct,
    resource_utilization_pct: Math.round(30 + load * 60),
    network_health_score: healthScore,
  };

  const alerts: MockAlert[] = incident
    ? [{ towerId: incident.tower, severity: 'critical', message: `Tower ${incident.tower} offline — ${incident.weather} conditions` }]
    : weatherIncident
      ? [{ towerId: weatherIncident.tower, severity: 'warning', message: `${weatherIncident.tower} recovering — elevated load` }]
      : [];

  const avgBandwidthMbps = Math.round((towerRows.reduce((sum, t) => sum + t.available_bandwidth_mbps, 0) / towerRows.length) * 10) / 10;

  return {
    id: `frame-${frameIndex}`,
    label,
    timestamp,
    tickIndex,
    hour,
    healthData,
    towerData: new Map(towerRows.map((t) => [t.tower_id, t])),
    failureData: new Map(failureRows.map((f) => [f.tower_id, f])),
    edgeData: new Map(edgeRows.map((e) => [e.edge_id, e])),
    alerts,
    avgLatencyMs: latencyMs,
    avgBandwidthMbps,
  };
}

export const MOCK_TIMELINE_FRAMES: MockFrame[] = Array.from({ length: FRAME_COUNT }, (_, i) => buildFrame(i));

/** 13 fixed axis labels for the scrubber/chart — every 2 hours, 00:00 through 24:00. */
export const TIMELINE_HOUR_LABELS: string[] = Array.from({ length: 13 }, (_, i) => `${String(i * 2).padStart(2, '0')}:00`);

export const SIMULATION_DURATION_LABEL = '24:00:00';
