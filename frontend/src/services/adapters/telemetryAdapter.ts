/**
 * Transforms real backend fleet payloads into the frontend's existing, unchanged data model
 * (`types/index.ts`). Components never see backend field names — this is the only file that
 * translates between the two, so a backend schema change only ever touches this module.
 */
import type {
  TowerUtilizationResponse, TrafficResponse, FailureResponse, EdgeTelemetryResponse,
  NetworkHealthResponse, TowerResponse, EdgeServerResponse,
} from '../../types/backend';
import type {
  TowerUtilizationRow, TrafficProfileRow, TowerFailureRow, EdgeServerRow,
  NetworkHealthRow, NetworkNodeRow,
} from '../../types';

export function adaptTowerUtilization(r: TowerUtilizationResponse): TowerUtilizationRow {
  return {
    timestamp: r.timestamp,
    tower_id: r.tower_id,
    users: r.users,
    available_bandwidth_mbps: r.available_bandwidth_mbps,
    latency_ms: r.latency_ms,
    packet_loss_pct: r.packet_loss_pct,
    power_usage_pct: r.power_usage_pct,
    temperature_c: r.temperature_c,
  };
}

export function adaptTraffic(r: TrafficResponse): TrafficProfileRow {
  return {
    timestamp: r.timestamp,
    tower_id: r.tower_id,
    video_users: r.video_users,
    voice_users: r.voice_users,
    iot_devices: r.iot_devices,
    gaming_users: r.gaming_users,
    emergency_users: r.emergency_users,
  };
}

export function adaptFailure(r: FailureResponse): TowerFailureRow {
  return {
    tower_id: r.tower_id,
    temperature_c: r.temperature_c,
    power_usage_pct: r.power_usage_pct,
    traffic_load: r.traffic_load,
    weather: r.weather,
    cpu_usage_pct: r.cpu_usage_pct,
    failed: r.failed ? 1 : 0,
  };
}

export function adaptEdgeTelemetry(r: EdgeTelemetryResponse): EdgeServerRow {
  return {
    timestamp: r.timestamp,
    edge_id: r.edge_id,
    cpu_pct: r.cpu_pct,
    gpu_pct: r.gpu_pct,
    memory_pct: r.memory_pct,
    requests_per_min: r.requests_per_min,
    latency_ms: r.latency_ms,
  };
}

export function adaptNetworkHealth(r: NetworkHealthResponse): NetworkHealthRow {
  return {
    latency_ms: r.latency_ms,
    packet_loss_pct: r.packet_loss_pct,
    availability_pct: r.availability_pct,
    energy_usage_pct: r.energy_usage_pct,
    resource_utilization_pct: r.resource_utilization_pct,
    network_health_score: r.overall_health_index,
  };
}

/** Derives the node list (used for topology/connected-node lookups) from the real towers + edges. */
export function adaptNodes(towers: TowerResponse[], edges: EdgeServerResponse[]): NetworkNodeRow[] {
  return [
    ...towers.map((t): NetworkNodeRow => ({ node_id: t.tower_id, node_type: 'tower' })),
    ...edges.map((e): NetworkNodeRow => ({ node_id: e.edge_id, node_type: 'edge' })),
  ];
}
