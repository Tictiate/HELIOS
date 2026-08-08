import React from 'react';
import { FiShieldOff, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import type { NetworkSlice } from '../types/backend';

interface NetworkSlicesPanelProps {
  slices: NetworkSlice[];
}

const STATUS_META: Record<string, { label: string; color: string; icon: typeof FiCheckCircle }> = {
  VIOLATION: { label: 'Violation', color: 'var(--accent-red)', icon: FiShieldOff },
  DEGRADED: { label: 'Degraded', color: 'var(--accent-yellow)', icon: FiAlertTriangle },
  HEALTHY: { label: 'Healthy', color: 'var(--accent-green)', icon: FiCheckCircle },
};

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: 'var(--accent-red)',
  HIGH: 'var(--accent-orange)',
  MEDIUM: 'var(--text-secondary)',
  NORMAL: 'var(--text-muted)',
};

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms.toFixed(1)}`;
}

export const NetworkSlicesPanel: React.FC<NetworkSlicesPanelProps> = ({ slices }) => {
  if (!slices || slices.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ padding: '24px 0', color: 'var(--text-muted)', fontSize: '11px' }}>
        No slice telemetry available.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
            {['Slice', 'Priority', 'Allocated', 'Demand', 'Latency', 'Status'].map((h, i) => (
              <th key={h} className="label-caps-sm" style={{ padding: '8px 10px', textAlign: i >= 2 && i <= 4 ? 'right' : i === 5 ? 'center' : 'left', letterSpacing: '0.04em' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slices.map((slice) => {
            const meta = STATUS_META[slice.status] ?? STATUS_META.HEALTHY;
            const StatusIcon = meta.icon;
            const overDemand = slice.current_demand_mbps > slice.allocated_bandwidth_mbps;
            return (
              <tr key={slice.slice_id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.06)' }}>
                <td style={{ padding: '9px 10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{slice.name}</div>
                  <div className="label-caps-sm" style={{ letterSpacing: 0, fontSize: '9px', marginTop: 1 }}>{slice.slice_type}</div>
                </td>
                <td style={{ padding: '9px 10px', fontSize: '11px', fontWeight: 700, color: PRIORITY_COLOR[slice.priority] ?? 'var(--text-secondary)' }}>
                  {slice.priority}
                </td>
                <td style={{ padding: '9px 10px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {slice.allocated_bandwidth_mbps.toFixed(1)}
                </td>
                <td style={{ padding: '9px 10px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: overDemand ? 'var(--accent-red)' : 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                  {slice.current_demand_mbps.toFixed(1)}
                </td>
                <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                    {formatMs(slice.current_latency_ms)}<span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>ms</span>
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>tgt {slice.latency_target_ms}ms</div>
                </td>
                <td style={{ padding: '9px 10px' }}>
                  <div
                    className="flex items-center justify-center gap-1.5"
                    style={{
                      padding: '3px 8px', borderRadius: 10, background: `${meta.color}1a`,
                      border: `1px solid ${meta.color}33`, color: meta.color,
                    }}
                  >
                    <StatusIcon style={{ width: 11, height: 11 }} />
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{meta.label}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default NetworkSlicesPanel;
