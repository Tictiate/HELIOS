import React, { useMemo } from 'react';
import { FiCpu } from 'react-icons/fi';
import { useSimulation } from '../../context/SimulationContext';

type DecisionStatus = 'completed' | 'running' | 'queued' | 'failed';

interface Decision {
  id: string;
  text: string;
  status: DecisionStatus;
}

const STATUS_META: Record<DecisionStatus, { label: string; color: string; dot: string }> = {
  completed: { label: 'Completed', color: '#34d399', dot: 'green' },
  running: { label: 'Running', color: '#3b82f6', dot: 'blue' },
  queued: { label: 'Queued', color: '#94a3b8', dot: '' },
  failed: { label: 'Failed', color: '#f87171', dot: 'red' },
};

const STATIC_DECISIONS: Decision[] = [
  { id: 'd1', text: 'Rebalanced load across edge servers E1–E4', status: 'completed' },
  { id: 'd2', text: 'Updated routing weights for backbone links', status: 'completed' },
  { id: 'd3', text: 'Scheduled bandwidth audit for tower cluster', status: 'queued' },
];

/**
 * Reserved surface for the not-yet-built Explainable AI module — structured execution items
 * instead of prose. One entry reflects real current failure state (grounded, not fabricated);
 * the rest are static illustrative ops entries pending the real recommendation engine.
 */
const AIDecisionsPanel: React.FC = () => {
  const { state } = useSimulation();

  const decisions = useMemo((): Decision[] => {
    const failedTower = Array.from(state.failureData.entries()).find(([, f]) => f.failed === 1)?.[0];
    const liveEntry: Decision = failedTower
      ? { id: 'live', text: `Rerouting traffic from ${failedTower} to adjacent towers`, status: 'running' }
      : { id: 'live', text: 'Monitoring — all towers nominal', status: 'completed' };
    return [liveEntry, ...STATIC_DECISIONS];
  }, [state.failureData]);

  return (
    <div className="glass-card-static flex flex-col overflow-hidden" style={{ minWidth: '280px' }}>
      <div className="panel-header">
        <FiCpu className="icon icon-sm" style={{ color: 'var(--accent-purple, #a78bfa)' }} />
        <span className="label-caps">AI Decisions</span>
      </div>
      <div className="flex flex-col" style={{ padding: '2px 0' }}>
        {decisions.map((d) => {
          const meta = STATUS_META[d.status];
          return (
            <div key={d.id} className="flex items-center justify-between gap-2" style={{ padding: '8px 16px' }}>
              <div className="flex items-center gap-2.5" style={{ minWidth: 0 }}>
                {meta.dot ? (
                  <span className={`indicator-dot ${meta.dot}`} style={{ flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#475569', flexShrink: 0 }} />
                )}
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{d.text}</span>
              </div>
              <span style={{
                fontSize: '9px', fontWeight: 700, color: meta.color, background: `${meta.color}1a`,
                border: `1px solid ${meta.color}33`, padding: '2px 7px', borderRadius: '9px',
                textTransform: 'uppercase', letterSpacing: '0.03em', flexShrink: 0,
              }}>
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIDecisionsPanel;
