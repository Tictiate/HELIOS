/**
 * Strong TypeScript mirrors of the real HELIOS backend contract (`backend/app/schemas/*.py`,
 * the live simulator broadcast in `backend/app/simulator/live_simulator.py`, and the AI
 * pipeline stage outputs in `ai_engine/`/`simulator/digital_twin/`). No endpoint or field here
 * is invented — every shape traces back to a specific Python source file read during
 * integration. Fields the backend itself types as `Dict[str, Any]` (genuinely free-form) are
 * given the concrete sub-fields the code actually produces, plus `Record<string, unknown>` for
 * anything beyond that — never a fabricated exhaustive schema.
 */

// ─── Fleet layer (backend/app/schemas/network.py) ─────────────────────────

export interface TowerResponse {
  id: string;
  tower_id: string;
}

export interface EdgeServerResponse {
  id: string;
  edge_id: string;
}

export interface TowerUtilizationResponse {
  id: string;
  tower_id: string;
  timestamp: string;
  users: number;
  available_bandwidth_mbps: number;
  latency_ms: number;
  packet_loss_pct: number;
  power_usage_pct: number;
  temperature_c: number;
  utilization_score: number;
  congested: boolean;
}

export interface TrafficResponse {
  id: string;
  tower_id: string;
  timestamp: string;
  video_users: number;
  voice_users: number;
  iot_devices: number;
  gaming_users: number;
  emergency_users: number;
  total_users: number;
}

export interface FailureResponse {
  id: string;
  tower_id: string;
  temperature_c: number;
  power_usage_pct: number;
  traffic_load: number;
  weather: string;
  cpu_usage_pct: number;
  failed: boolean;
}

export interface EdgeTelemetryResponse {
  id: string;
  edge_id: string;
  timestamp: string;
  cpu_pct: number;
  gpu_pct: number;
  memory_pct: number;
  requests_per_min: number;
  latency_ms: number;
  edge_health: string;
}

export interface NetworkHealthResponse {
  id: string;
  timestamp: string | null;
  latency_ms: number;
  packet_loss_pct: number;
  availability_pct: number;
  energy_usage_pct: number;
  resource_utilization_pct: number;
  overall_health_index: number;
  health_category: string;
}

// ─── AI decision-loop layer ────────────────────────────────────────────────

export interface NetworkSlice {
  slice_id: string;
  name: string;
  slice_type: string;
  priority: string;
  allocated_bandwidth_mbps: number;
  minimum_bandwidth_mbps: number;
  maximum_bandwidth_mbps: number;
  active_users: number;
  current_demand_mbps: number;
  current_latency_ms: number;
  current_packet_loss_pct: number;
  latency_target_ms: number;
  packet_loss_target_pct: number;
  status: string;
}

/**
 * The single synthetic entity's telemetry (`backend/app/simulator/live_simulator.py`
 * `generate_mock_telemetry()`, evolved by `autonomous_executor.apply_strategy`). Some fields
 * only appear after at least one strategy has been executed (marked optional).
 */
export interface BackendTelemetryState {
  tower_id: string;
  users: number;
  available_bandwidth_mbps: number;
  latency_ms: number;
  packet_loss_pct: number;
  power_usage_pct: number;
  temperature_c: number;
  cpu_usage_pct: number;
  traffic_load: number;
  weather: string;
  network_health?: number;
  tower_utilization_pct?: number;
  memory_usage_pct?: number;
  slices?: NetworkSlice[];
}

/** `ai_engine/prediction/predict.py` `HELIOSAI.predict()` return shape. */
export interface PredictionOutput {
  tower_id: string;
  prediction: {
    congestion: { probability: number; prediction: string; confidence: number };
    failure: { probability: number; prediction: string; confidence: number };
  };
  network_health: number;
  health_status: string;
  overall_confidence: number;
  prediction_window: string;
  next_step: string;
  timestamp: string;
  execution_time_ms: number;
}

export type StrategyPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/** `ai_engine/decision/strategy_library.py` template shape + `strategy_id` stamped by the generator. */
export interface CandidateStrategy {
  name: string;
  category: string;
  description: string;
  expected_effect: Record<string, string>;
  prerequisites: string[];
  possible_risks: string[];
  estimated_execution_time: string;
  priority: StrategyPriority;
  strategy_id: string;
}

/** `ai_engine/decision/planner.py` `StrategyPlanner.plan()` return shape. */
export interface StrategiesOutput {
  tower_id: string;
  planner_version: string;
  generated_at: string;
  planning_time_ms: number;
  rules_triggered: string[];
  planning_goal: string;
  candidate_strategies: CandidateStrategy[];
}

/** `simulator/digital_twin/simulator.py` `DigitalTwinSimulator.simulate()` return shape. */
export interface SimulationOutput {
  tower_id: string;
  simulator_version: string;
  simulated_at: string;
  simulation_time_ms: number;
  simulated_strategies: Array<{
    strategy: string;
    strategy_id: string;
    category: string;
    timeline: Array<Record<string, number>>;
  }>;
}

export interface SliceChange {
  name: string;
  before_mbps: number;
  after_mbps: number;
  status_before: string;
  status_after: string;
}

/** `backend/app/services/autonomous_executor.py` `_build_report()` return shape. */
export interface ExecutionReport {
  execution_id: string;
  strategy: string;
  status: 'executed' | 'skipped';
  execution_time_ms: number;
  changed_metrics: Record<string, { before: number; after: number; delta: number }>;
  network_health_before: number;
  network_health_after: number;
  improvement_score: number;
  generated_at: string;
  slice_changes?: SliceChange[];
  sla_violations_before?: string[];
  sla_violations_after?: string[];
}

/** `backend/app/services/explainability_service.py` `generate_full_explanation()` return shape. */
export interface ExplainabilityOutput {
  prediction_explanation: Record<string, unknown>;
  strategy_explanation: Record<string, unknown>;
  simulation_explanation: Record<string, unknown>;
  execution_explanation: Record<string, unknown>;
  helios_insight: string;
}

/** `scenario_engine.py` `generate_metadata()` return shape, present on the WS payload only while a scenario was just applied. */
export interface ScenarioMetadata {
  scenario_id: string;
  scenario_name: string;
  timestamp: string;
  affected_towers: string[];
  affected_edges: string[];
  severity: 'high' | 'medium';
}

/** The exact object broadcast once/second by `live_simulator_task()` over `ws://localhost:8000/ws/network`. */
export interface NetworkWsMessage {
  id: string;
  timestamp: string;
  telemetry: BackendTelemetryState;
  prediction: PredictionOutput;
  strategies: StrategiesOutput;
  simulation: SimulationOutput;
  execution: ExecutionReport;
  explainability: ExplainabilityOutput;
  scenario: ScenarioMetadata | null;
}

// ─── Persisted snapshot / execution / explainability / scenario records ───

/** `backend/app/schemas/snapshot.py` `NetworkSnapshotResponse`. */
export interface NetworkSnapshotResponse {
  id: string;
  timestamp: string;
  telemetry: BackendTelemetryState;
  prediction: PredictionOutput;
  strategies: StrategiesOutput;
  simulation: SimulationOutput;
}

/** `backend/app/schemas/execution.py` `ExecutionHistoryResponse`. */
export interface ExecutionHistoryResponse {
  id: string;
  timestamp: string;
  strategy: string;
  execution_status: string;
  execution_time_ms: number;
  snapshot_before: Record<string, unknown>;
  snapshot_after: Record<string, unknown>;
  improvement_score: number;
  changed_metrics: Record<string, unknown>;
}

/** `backend/app/schemas/explainability.py` `ExplainabilityHistoryResponse`. */
export interface ExplainabilityHistoryResponse {
  id: string;
  timestamp: string;
  snapshot_id: string;
  prediction_explanation: Record<string, unknown>;
  strategy_explanation: Record<string, unknown>;
  simulation_explanation: Record<string, unknown>;
  execution_explanation: Record<string, unknown>;
  helios_insight: string;
}

/** `backend/app/schemas/scenario.py` `ScenarioHistoryResponse`. */
export interface ScenarioHistoryResponse {
  id: string;
  timestamp: string;
  scenario_id: string;
  scenario_name: string;
  affected_towers: string[];
  affected_edges: string[];
  severity: string;
  snapshot_before: Record<string, unknown>;
  snapshot_after: Record<string, unknown>;
}

export interface ScenarioInjectRequest {
  scenario_name: string;
}

export interface ScenarioScheduleRequest {
  scenario_name: string;
  execute_in_seconds: number;
}

export interface ScenarioScheduleResponse {
  message: string;
  execute_at: string;
}

export interface ScenarioActionResponse {
  message: string;
}
