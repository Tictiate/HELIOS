/**
 * Snapshot / execution / explainability REST endpoints — `backend/app/api/network.py`
 * (mounted at root, no prefix). These back the AI decision-loop layer: `/latest` and
 * `/history` are what the Simulation Replay timeline scrubs through per the "Replay must use
 * REST snapshots" requirement.
 */
import { apiGet } from './client';
import type {
  NetworkSnapshotResponse, ExecutionHistoryResponse, ExplainabilityHistoryResponse,
} from '../../types/backend';

export function getLatestSnapshot(): Promise<NetworkSnapshotResponse> {
  return apiGet('/latest');
}

export function getSnapshotHistory(limit = 100): Promise<NetworkSnapshotResponse[]> {
  return apiGet(`/history?limit=${limit}`);
}

export function getSnapshotById(snapshotId: string): Promise<NetworkSnapshotResponse> {
  return apiGet(`/snapshot/${encodeURIComponent(snapshotId)}`);
}

export function getLatestExecution(): Promise<ExecutionHistoryResponse> {
  return apiGet('/executions/latest');
}

export function getExecutionHistory(limit = 100): Promise<ExecutionHistoryResponse[]> {
  return apiGet(`/executions/history?limit=${limit}`);
}

export function getLatestExplainability(): Promise<ExplainabilityHistoryResponse> {
  return apiGet('/explain/latest');
}

export function getExplainabilityForSnapshot(snapshotId: string): Promise<ExplainabilityHistoryResponse> {
  return apiGet(`/explain/${encodeURIComponent(snapshotId)}`);
}
