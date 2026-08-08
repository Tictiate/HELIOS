import React from 'react';
import type { NetworkSlice } from '../types/backend';

interface BandwidthVisualizationProps {
  slices: NetworkSlice[];
  /** Compact renders just the bar (no title/legend) for use in a small summary strip. */
  compact?: boolean;
}

const SLICE_COLORS: Record<string, string> = {
  emergency: 'var(--accent-red)',
  voice: 'var(--accent-blue)',
  iot: 'var(--accent-purple)',
  gaming: 'var(--accent-orange)',
  video: 'var(--accent-cyan)',
};
const FALLBACK_COLOR = 'var(--text-muted)';

function colorFor(sliceType: string): string {
  return SLICE_COLORS[sliceType.toLowerCase()] ?? FALLBACK_COLOR;
}

export const BandwidthVisualization: React.FC<BandwidthVisualizationProps> = ({ slices, compact = false }) => {
  if (!slices || slices.length === 0) {
    return <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No slice data available</div>;
  }

  const totalCapacityMbps = slices.reduce((sum, s) => sum + s.allocated_bandwidth_mbps, 0) || 1;
  const barHeight = compact ? 8 : 26;

  return (
    <div className="flex flex-col" style={{ gap: compact ? 0 : 12 }}>
      {!compact && (
        <div className="flex items-center justify-between">
          <span className="label-caps-sm">Tower Bandwidth Allocation</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{totalCapacityMbps.toFixed(0)} Mbps total</span>
        </div>
      )}

      <div
        className="flex"
        style={{
          width: '100%', height: barHeight, borderRadius: compact ? 5 : 8, overflow: 'hidden',
          background: 'rgba(148, 163, 184, 0.08)', border: '1px solid rgba(148, 163, 184, 0.12)',
        }}
      >
        {slices.map((slice) => {
          const widthPct = Math.min(100, (slice.allocated_bandwidth_mbps / totalCapacityMbps) * 100);
          return (
            <div
              key={slice.slice_id}
              title={`${slice.name}: ${slice.allocated_bandwidth_mbps.toFixed(1)} Mbps`}
              style={{
                width: `${widthPct}%`, height: '100%', background: colorFor(slice.slice_type),
                borderRight: '1px solid rgba(6, 10, 20, 0.5)', transition: 'width var(--dur-base) ease',
              }}
            />
          );
        })}
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center" style={{ gap: 12 }}>
          {slices.map((slice) => (
            <div key={slice.slice_id} className="flex items-center gap-1.5">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: colorFor(slice.slice_type), display: 'inline-block' }} />
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {slice.name} <span style={{ color: 'var(--text-muted)' }}>({slice.allocated_bandwidth_mbps.toFixed(0)}M)</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BandwidthVisualization;
