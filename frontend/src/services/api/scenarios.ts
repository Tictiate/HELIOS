/**
 * Scenario injection REST endpoints — `backend/app/api/scenario.py` (prefix `/scenarios`).
 */
import { apiGet, apiPost } from './client';
import type {
  ScenarioInjectRequest, ScenarioScheduleRequest, ScenarioScheduleResponse,
  ScenarioActionResponse, ScenarioHistoryResponse,
} from '../../types/backend';

export function listScenarios(): Promise<string[]> {
  return apiGet('/scenarios');
}

export function injectScenario(scenarioName: string): Promise<ScenarioActionResponse> {
  const body: ScenarioInjectRequest = { scenario_name: scenarioName };
  return apiPost('/scenarios/inject', body);
}

export function scheduleScenario(scenarioName: string, executeInSeconds: number): Promise<ScenarioScheduleResponse> {
  const body: ScenarioScheduleRequest = { scenario_name: scenarioName, execute_in_seconds: executeInSeconds };
  return apiPost('/scenarios/schedule', body);
}

export function startRandomChaos(): Promise<ScenarioActionResponse> {
  return apiPost('/scenarios/random/start');
}

export function stopRandomChaos(): Promise<ScenarioActionResponse> {
  return apiPost('/scenarios/random/stop');
}

export function getScenarioHistory(limit = 100): Promise<ScenarioHistoryResponse[]> {
  return apiGet(`/scenarios/history?limit=${limit}`);
}
