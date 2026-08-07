/**
 * Fleet (Digital Twin) REST endpoints — `backend/app/api/network.py` (mounted at root, no
 * `/network` prefix — confirmed by reading `api_router.py`). Static-but-real per-tower/edge
 * history imported from the same processed datasets the frontend used to mock client-side.
 */
import { apiGet } from './client';
import type {
  TowerResponse, TowerUtilizationResponse, TrafficResponse, FailureResponse,
  EdgeServerResponse, EdgeTelemetryResponse, NetworkHealthResponse,
} from '../../types/backend';

function qs(skip: number, limit: number): string {
  return `?skip=${skip}&limit=${limit}`;
}

export function getTowers(skip = 0, limit = 100): Promise<TowerResponse[]> {
  return apiGet(`/towers${qs(skip, limit)}`);
}

export function getTower(towerId: string): Promise<TowerResponse> {
  return apiGet(`/towers/${encodeURIComponent(towerId)}`);
}

export function getTowerUtilization(towerId: string, skip = 0, limit = 100): Promise<TowerUtilizationResponse[]> {
  return apiGet(`/towers/${encodeURIComponent(towerId)}/utilization${qs(skip, limit)}`);
}

export function getTowerTraffic(towerId: string, skip = 0, limit = 100): Promise<TrafficResponse[]> {
  return apiGet(`/towers/${encodeURIComponent(towerId)}/traffic${qs(skip, limit)}`);
}

export function getTowerFailures(towerId: string, skip = 0, limit = 100): Promise<FailureResponse[]> {
  return apiGet(`/towers/${encodeURIComponent(towerId)}/failures${qs(skip, limit)}`);
}

export function getEdges(skip = 0, limit = 100): Promise<EdgeServerResponse[]> {
  return apiGet(`/edges${qs(skip, limit)}`);
}

export function getEdge(edgeId: string): Promise<EdgeServerResponse> {
  return apiGet(`/edges/${encodeURIComponent(edgeId)}`);
}

export function getEdgeTelemetry(edgeId: string, skip = 0, limit = 100): Promise<EdgeTelemetryResponse[]> {
  return apiGet(`/edges/${encodeURIComponent(edgeId)}/telemetry${qs(skip, limit)}`);
}

export function getNetworkHealth(skip = 0, limit = 100): Promise<NetworkHealthResponse[]> {
  return apiGet(`/network-health${qs(skip, limit)}`);
}
