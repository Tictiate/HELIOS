import React, { useState } from 'react';
import { FiCpu } from 'react-icons/fi';
import { useSimulation } from '../../context/SimulationContext';
import type { AiDecisionItem, AiDecisionStatus } from '../../services/adapters/aiLoopAdapter';
import SlideOver from '../common/SlideOver';

export const AI_DECISION_STATUS_META: Record<AiDecisionStatus, { label: string; color: string; dot: string }> = {
  completed: { label: 'Completed', color: '#34d399', dot: 'green' },
  running: { label: 'Running', color: '#3b82f6', dot: 'blue' },
  queued: { label: 'Queued', color: '#94a3b8', dot: '' },
  failed: { label: 'Failed', color: '#f87171', dot: 'red' },
};

const VISIBLE_COUNT = 4;

const DecisionRow: React.FC<{ d: AiDecisionItem }> = ({ d }) => {
  const meta = AI_DECISION_STATUS_META[d.status];
  return (
    <div className="flex items-center justify-between gap-2" style={{ padding: '9px 18px' }}>
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
};

/** Real execution/strategy data from the backend AI decision loop — `state.aiDecisions` is
 * built in SimulationContext from the live WebSocket `execution`/`strategies` fields. Only the
 * latest few show inline; the full (already client-capped) history is one click away. */
const AIDecisionsPanel: React.FC = () => {
  const { aiDecisions, prediction } = useSimulation();
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const visible = aiDecisions.slice(0, VISIBLE_COUNT);

  return (
    <div className="glass-card-static flex flex-col overflow-hidden" style={{ minWidth: '280px' }}>
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2.5">
          <FiCpu className="icon icon-sm" style={{ color: 'var(--accent-purple, #a78bfa)' }} />
          <span className="label-caps">AI Decisions</span>
        </div>
        <div className="flex items-center gap-2">
          {prediction && (
            <span className="panel-badge" style={{ fontSize: '9px', marginLeft: 0 }}>
              {prediction.healthStatus} · {prediction.confidence.toFixed(0)}% conf.
            </span>
          )}
          {aiDecisions.length > VISIBLE_COUNT && (
            <button className="timeline-btn" style={{ padding: '3px 9px' }} onClick={() => setViewAllOpen(true)}>
              View All
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col" style={{ padding: '4px 0' }}>
        {visible.length === 0 ? (
          <div style={{ padding: '14px 18px', fontSize: '11px', color: 'var(--text-muted)' }}>
            Waiting for the first AI decision cycle…
          </div>
        ) : (
          visible.map((d) => <DecisionRow key={d.id} d={d} />)
        )}
      </div>

      <SlideOver open={viewAllOpen} onClose={() => setViewAllOpen(false)} title="AI Decisions — Full History" width="400px">
        <div className="flex flex-col" style={{ padding: '8px 0' }}>
          {aiDecisions.map((d) => <DecisionRow key={d.id} d={d} />)}
        </div>
      </SlideOver>
    </div>
  );
};

export default AIDecisionsPanel;
