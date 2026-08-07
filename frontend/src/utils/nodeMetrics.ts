import type { EdgeServerRow, TowerFailureRow, TowerUtilizationRow } from '../types';

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export type NodeStatus = 'operational' | 'degraded' | 'critical';

export const NODE_STATUS_META: Record<NodeStatus, { label: string; color: string }> = {
  operational: { label: 'Operational', color: '#34d399' },
  degraded: { label: 'Degraded', color: '#fbbf24' },
  critical: { label: 'Critical', color: '#f87171' },
};

export function getNodeStatus(failed: boolean, utilizationPct: number | null): NodeStatus {
  if (failed) return 'critical';
  if (utilizationPct !== null && utilizationPct >= 70) return 'degraded';
  return 'operational';
}

/** Tower utilization (0-100) — higher bandwidth availability = lower utilization. */
export function getTowerUtilization(tower: TowerUtilizationRow): number {
  return clamp(100 - tower.available_bandwidth_mbps, 0, 100);
}

/** 0-100 composite score from real per-tick telemetry — same category of derivation as the
 * existing failure-risk calc in NodeDetailPanel, centralized and weighted. */
export function getTowerHealthScore(tower: TowerUtilizationRow, failure?: TowerFailureRow): number {
  if (failure?.failed === 1) return 5;
  const utilizationRisk = getTowerUtilization(tower);
  const latencyRisk = clamp((tower.latency_ms / 60) * 100, 0, 100);
  const lossRisk = clamp(tower.packet_loss_pct * 20, 0, 100);
  const risk = utilizationRisk * 0.4 + latencyRisk * 0.3 + lossRisk * 0.3;
  return Math.round(clamp(100 - risk, 0, 100));
}

export function getEdgeHealthScore(edge: EdgeServerRow): number {
  const risk = (edge.cpu_pct + edge.gpu_pct + edge.memory_pct) / 3;
  return Math.round(clamp(100 - risk, 0, 100));
}

export type EdgeStatus = 'healthy' | 'high-traffic' | 'warning' | 'critical';

export const EDGE_STATUS_META: Record<EdgeStatus, { label: string; color: string; width: number }> = {
  healthy: { label: 'Healthy', color: '#67e8f9', width: 1.5 },
  'high-traffic': { label: 'High Traffic', color: '#3b82f6', width: 2.25 },
  warning: { label: 'Warning', color: '#fbbf24', width: 2.75 },
  critical: { label: 'Critical', color: '#f87171', width: 3.25 },
};

/** Reuses the exact utilization thresholds already established for the tower heatmap (<40/<70/else). */
export function getLinkStatus(utilizationPct: number, failed: boolean): EdgeStatus {
  if (failed) return 'critical';
  if (utilizationPct >= 70) return 'warning';
  if (utilizationPct >= 40) return 'high-traffic';
  return 'healthy';
}
