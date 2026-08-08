import React, { useState } from 'react';
import { FiLayers } from 'react-icons/fi';
import { useSimulation } from '../context/SimulationContext';
import { NetworkSlicesPanel } from './NetworkSlicesPanel';
import { BandwidthVisualization } from './BandwidthVisualization';
import SlideOver from './common/SlideOver';

/**
 * Network slice telemetry (`telemetry.slices`) comes from the same single simulated entity as
 * the rest of the AI-loop layer — see `SimulationContext`'s `telemetry` field, sourced from the
 * live WS frame or the active replay snapshot. Compact strip stays fixed-height so it doesn't
 * compete with Topology/Replay for the center column's space; "View Slices" opens the full
 * breakdown in a slide-over, same pattern as AI Decisions/Alerts "View All".
 */
export const NetworkSlicesContainer: React.FC = () => {
  const { telemetry } = useSimulation();
  const [expanded, setExpanded] = useState(false);
  const slices = telemetry?.slices;

  if (!slices || slices.length === 0) {
    return (
      <div className="glass-card-static flex items-center justify-between" style={{ padding: '10px 16px' }}>
        <div className="flex items-center gap-2.5">
          <FiLayers className="icon icon-sm" style={{ color: 'var(--text-muted)' }} />
          <span className="label-caps">Network Slices</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No slice data available</span>
      </div>
    );
  }

  const violations = slices.filter((s) => s.status === 'VIOLATION').length;
  const degraded = slices.filter((s) => s.status === 'DEGRADED').length;
  const statusSummary = violations > 0
    ? `${violations} violation${violations > 1 ? 's' : ''}${degraded > 0 ? `, ${degraded} degraded` : ''}`
    : degraded > 0
      ? `${degraded} degraded`
      : 'All slices healthy';
  const statusColor = violations > 0 ? 'var(--accent-red)' : degraded > 0 ? 'var(--accent-yellow)' : 'var(--accent-green)';

  return (
    <div className="glass-card-static flex flex-col" style={{ overflow: 'hidden' }}>
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2.5">
          <FiLayers className="icon icon-sm" style={{ color: 'var(--accent-purple, #a78bfa)' }} />
          <span className="label-caps">Network Slices</span>
          <span className="panel-badge" style={{ marginLeft: 0 }}>{slices.length}</span>
        </div>
        <button onClick={() => setExpanded(true)} className="timeline-btn" style={{ padding: '3px 9px' }}>
          View Slices
        </button>
      </div>
      <div style={{ padding: '12px 16px' }}>
        <BandwidthVisualization slices={slices} compact />
        <div style={{ marginTop: 8, fontSize: '10px', fontWeight: 600, color: statusColor }}>{statusSummary}</div>
      </div>

      <SlideOver open={expanded} onClose={() => setExpanded(false)} title="Network Slices" width="46vw">
        <div className="flex flex-col" style={{ padding: '18px 20px', gap: 20 }}>
          <BandwidthVisualization slices={slices} />
          <NetworkSlicesPanel slices={slices} />
        </div>
      </SlideOver>
    </div>
  );
};

export default NetworkSlicesContainer;
