// ─── Data Row Types ───────────────────────────────────────────────

export interface TowerUtilizationRow {
  timestamp: string;
  tower_id: string;
  users: number;
  available_bandwidth_mbps: number;
  latency_ms: number;
  packet_loss_pct: number;
  power_usage_pct: number;
  temperature_c: number;
}

export interface TrafficProfileRow {
  timestamp: string;
  tower_id: string;
  video_users: number;
  voice_users: number;
  iot_devices: number;
  gaming_users: number;
  emergency_users: number;
}

export interface TowerFailureRow {
  tower_id: string;
  temperature_c: number;
  power_usage_pct: number;
  traffic_load: number;
  weather: string;
  cpu_usage_pct: number;
  failed: number;
}

export interface EdgeServerRow {
  timestamp: string;
  edge_id: string;
  cpu_pct: number;
  gpu_pct: number;
  memory_pct: number;
  requests_per_min: number;
  latency_ms: number;
}

export interface NetworkHealthRow {
  latency_ms: number;
  packet_loss_pct: number;
  availability_pct: number;
  energy_usage_pct: number;
  resource_utilization_pct: number;
  network_health_score: number;
}

export interface NetworkNodeRow {
  node_id: string;
  node_type: 'tower' | 'edge' | 'critical' | 'core';
}

// ─── Simulation State ─────────────────────────────────────────────

export interface SimulationState {
  currentTick: number;
  isPlaying: boolean;
  speed: number;
  timestamp: string;
  towerData: Map<string, TowerUtilizationRow>;
  trafficData: Map<string, TrafficProfileRow>;
  failureData: Map<string, TowerFailureRow>;
  edgeData: Map<string, EdgeServerRow>;
  healthData: NetworkHealthRow | null;
  nodes: NetworkNodeRow[];
  healthHistory: NetworkHealthRow[];
  towerHistory: Map<string, TowerUtilizationRow[]>;
  edgeHistory: Map<string, EdgeServerRow[]>;
  trafficHistory: TrafficProfileRow[];
}

export interface SimulationControls {
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  seekTo: (tick: number) => void;
}

// ─── Event Log ────────────────────────────────────────────────────

export type EventSeverity = 'info' | 'warning' | 'critical' | 'success';

export interface SimulationEvent {
  id: string;
  timestamp: string;
  message: string;
  severity: EventSeverity;
  nodeId?: string;
}

// ─── UI State ─────────────────────────────────────────────────────

export interface SelectedNode {
  id: string;
  type: 'tower' | 'edge' | 'critical' | 'core' | 'user';
}

export interface FilterState {
  towers: boolean;
  users: boolean;
  edges: boolean;
  critical: boolean;
  traffic: boolean;
  failures: boolean;
}
