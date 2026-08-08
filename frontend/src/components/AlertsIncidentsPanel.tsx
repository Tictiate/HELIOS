import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiAlertTriangle, FiAlertOctagon, FiCheckCircle } from 'react-icons/fi';
import { useSimulation } from '../context/SimulationContext';
import type { AlertItem } from '../services/adapters/aiLoopAdapter';
import SlideOver from './common/SlideOver';

const SEVERITY_META: Record<'critical' | 'warning', { label: string; color: string; icon: typeof FiAlertOctagon }> = {
  critical: { label: 'Critical', color: '#f87171', icon: FiAlertOctagon },
  warning: { label: 'Warning', color: '#fbbf24', icon: FiAlertTriangle },
};

const VISIBLE_COUNT = 4;

function formatElapsed(detectedAt: string): string {
  const ms = Date.now() - new Date(detectedAt).getTime();
  const minutes = Math.max(0, Math.floor(ms / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

const AlertCard: React.FC<{ alert: AlertItem; onClick: () => void }> = ({ alert, onClick }) => {
  const sev = SEVERITY_META[alert.severity];
  const SevIcon = sev.icon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={alert.severity === 'critical' ? 'animate-pulse-glow' : ''}
      style={{
        borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
        background: `linear-gradient(135deg, ${sev.color}1c, ${sev.color}08)`,
        border: `1px solid ${sev.color}40`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <SevIcon className="icon icon-sm" style={{ color: sev.color, marginTop: 1, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: sev.color }}>
              {sev.label} — {alert.towerId}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {alert.message}
            </div>
          </div>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, whiteSpace: 'nowrap' }}>
          {formatElapsed(alert.detectedAt)}
        </span>
      </div>
    </motion.div>
  );
};

/** Real incidents derived from backend scenario-injection events (WS `scenario` field / the
 * `alerts` state built in SimulationContext) — no locally-simulated failure state anymore. Only
 * the most recent few show inline; "View All" opens the full (already client-capped) list. */
const AlertsIncidentsPanel: React.FC = () => {
  const { alerts, setSelectedNode } = useSimulation();
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const visible = alerts.slice(0, VISIBLE_COUNT);

  return (
    <div className="glass-card-static h-full flex flex-col overflow-hidden">
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2.5">
          <FiAlertOctagon className="icon icon-sm" style={{ color: 'var(--accent-red)' }} />
          <span className="label-caps">Alerts &amp; Incidents</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="panel-badge" style={{ marginLeft: 0 }}>{alerts.length}</span>
          {alerts.length > VISIBLE_COUNT && (
            <button className="timeline-btn" style={{ padding: '3px 9px' }} onClick={() => setViewAllOpen(true)}>
              View All
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {visible.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4" style={{ color: 'var(--text-muted)' }}>
            <FiCheckCircle style={{ width: 22, height: 22, color: 'var(--accent-green)', opacity: 0.7 }} />
            <span style={{ fontSize: '11px' }}>All systems nominal</span>
          </div>
        ) : (
          <AnimatePresence>
            {visible.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onClick={() => setSelectedNode({ id: alert.towerId, type: 'tower' })} />
            ))}
          </AnimatePresence>
        )}
      </div>

      <SlideOver open={viewAllOpen} onClose={() => setViewAllOpen(false)} title="Alerts & Incidents — Full History" width="400px">
        <div className="p-3 flex flex-col gap-2">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onClick={() => { setSelectedNode({ id: alert.towerId, type: 'tower' }); setViewAllOpen(false); }}
            />
          ))}
        </div>
      </SlideOver>
    </div>
  );
};

export default AlertsIncidentsPanel;
