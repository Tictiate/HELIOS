/**
 * Transforms the AI decision-loop backend payloads (WebSocket broadcast, execution/
 * explainability/scenario REST records) into small view models the AI-side panels consume.
 * Same isolation principle as telemetryAdapter — no component reads a backend field directly.
 */
import type {
  ExecutionReport, ExecutionHistoryResponse, PredictionOutput, StrategiesOutput,
  ScenarioMetadata, ScenarioHistoryResponse, ExplainabilityOutput, ExplainabilityHistoryResponse,
  CandidateStrategy,
} from '../../types/backend';

export type AiDecisionStatus = 'completed' | 'running' | 'queued' | 'failed';

export interface AiDecisionItem {
  id: string;
  text: string;
  status: AiDecisionStatus;
  timestamp: string;
}

export interface PredictionSummary {
  healthStatus: string;
  networkHealth: number;
  congestionProbability: number;
  failureProbability: number;
  confidence: number;
}

export interface StrategySummary {
  planningGoal: string;
  rulesTriggered: string[];
  topCandidate: CandidateStrategy | null;
}

export interface AlertItem {
  id: string;
  towerId: string;
  severity: 'critical' | 'warning';
  message: string;
  detectedAt: string;
}

export interface AssistantInsight {
  text: string;
  timestamp: string;
}

/** Maps the backend's real {"executed","skipped"} vocabulary + improvement score onto the
 * dashboard's existing Completed/Running/Queued/Failed badge language. */
function statusFromReport(status: string, improvementScore: number): AiDecisionStatus {
  if (status === 'skipped') return 'queued';
  if (status === 'executed') return improvementScore < 0 ? 'failed' : 'completed';
  return 'queued';
}

export function adaptExecutionReport(report: ExecutionReport, id?: string): AiDecisionItem {
  return {
    id: id ?? report.execution_id,
    text: report.strategy === 'None' ? 'No action required — network nominal' : report.strategy,
    status: statusFromReport(report.status, report.improvement_score),
    timestamp: report.generated_at,
  };
}

export function adaptExecutionHistory(e: ExecutionHistoryResponse): AiDecisionItem {
  return {
    id: e.id,
    text: e.strategy === 'None' ? 'No action required — network nominal' : e.strategy,
    status: statusFromReport(e.execution_status, e.improvement_score),
    timestamp: e.timestamp,
  };
}

export function adaptPrediction(p: PredictionOutput): PredictionSummary {
  return {
    healthStatus: p.health_status,
    networkHealth: p.network_health,
    congestionProbability: p.prediction.congestion.probability,
    failureProbability: p.prediction.failure.probability,
    confidence: p.overall_confidence,
  };
}

export function adaptStrategies(s: StrategiesOutput): StrategySummary {
  return {
    planningGoal: s.planning_goal,
    rulesTriggered: s.rules_triggered,
    topCandidate: s.candidate_strategies[0] ?? null,
  };
}

/** A live "recommended but not yet executed" line, surfaced from the planner's top candidate. */
export function strategyToQueuedDecision(strategy: CandidateStrategy): AiDecisionItem {
  return {
    id: `candidate-${strategy.strategy_id}`,
    text: `Recommended: ${strategy.name}`,
    status: 'queued',
    timestamp: new Date().toISOString(),
  };
}

export function adaptScenarioMetadata(s: ScenarioMetadata): AlertItem {
  const towerId = s.affected_towers[0] ?? s.affected_edges[0] ?? 'Network';
  return {
    id: s.scenario_id,
    towerId,
    severity: s.severity === 'high' ? 'critical' : 'warning',
    message: `${s.scenario_name} affecting ${towerId}`,
    detectedAt: s.timestamp,
  };
}

export function adaptScenarioHistory(s: ScenarioHistoryResponse): AlertItem {
  const towerId = s.affected_towers[0] ?? s.affected_edges[0] ?? 'Network';
  return {
    id: s.id,
    towerId,
    severity: s.severity === 'high' ? 'critical' : 'warning',
    message: `${s.scenario_name} affecting ${towerId}`,
    detectedAt: s.timestamp,
  };
}

export function adaptInsight(e: ExplainabilityOutput | ExplainabilityHistoryResponse, timestamp?: string): AssistantInsight {
  return {
    text: e.helios_insight || 'Monitoring network conditions — no insight generated yet.',
    timestamp: timestamp ?? new Date().toISOString(),
  };
}
