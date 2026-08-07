import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiAlertTriangle, FiAlertOctagon, FiCheckCircle } from 'react-icons/fi';
import { useSimulation } from '../context/SimulationContext';
import { getTowerUtilization } from '../utils/nodeMetrics';

type IncidentSeverity = 'critical' | 'warning';

interface Incident {
  id: string;
  towerId: string;
  severity: IncidentSeverity;
  detectedTick: number;
  detectedTimestamp: string;
  weather?: string;
}

const SEVERITY_META: Record<IncidentSeverity, { label: string; color: string; icon: typeof FiAlertOctagon }> = {
  critical: { label: 'Critical', color: '#f87171', icon: FiAlertOctagon },
  warning: { label: 'Warning', color: '#fbbf24', icon: FiAlertTriangle },
};

const AlertsIncidentsPanel: React.FC = () => {
  const { state, setSelectedNode } = useSimulation();
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    setIncidents((prev) => {
      const next = [...prev];

      state.failureData.forEach((failure, towerId) => {
        if (failure.failed === 1 && !next.some((i) => i.towerId === towerId && i.severity === 'critical')) {
          next.push({
            id: `${state.currentTick}-critical-${towerId}`,
            towerId, severity: 'critical',
            detectedTick: state.currentTick, detectedTimestamp: state.timestamp,
            weather: failure.weather,
          });
        }
      });

      state.towerData.forEach((tower, towerId) => {
        const failed = state.failureData.get(towerId)?.failed === 1;
        const utilization = getTowerUtilization(tower);
        if (!failed && utilization >= 85 && !next.some((i) => i.towerId === towerId && i.severity === 'warning')) {
          next.push({
            id: `${state.currentTick}-warning-${towerId}`,
            towerId, severity: 'warning',
            detectedTick: state.currentTick, detectedTimestamp: state.timestamp,
          });
        }
      });

      return next.filter((i) => {
        const failed = state.failureData.get(i.towerId)?.failed === 1;
        if (i.severity === 'critical') return failed;
        const tower = state.towerData.get(i.towerId);
        const utilization = tower ? getTowerUtilization(tower) : 0;
        return !failed && utilization >= 85;
      });
    });
  }, [state.failureData, state.towerData, state.currentTick, state.timestamp]);

  return (
    <div className="glass-card-static h-full flex flex-col overflow-hidden">
      <div className="panel-header">
        <FiAlertOctagon className="icon icon-sm" style={{ color: 'var(--accent-red)' }} />
        <span className="label-caps">Alerts &amp; Incidents</span>
        <span className="panel-badge">{incidents.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {incidents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4" style={{ color: 'var(--text-muted)' }}>
            <FiCheckCircle style={{ width: 22, height: 22, color: 'var(--accent-green)', opacity: 0.7 }} />
            <span style={{ fontSize: '11px' }}>All systems nominal</span>
          </div>
        ) : (
          <AnimatePresence>
            {incidents.map((incident) => {
              const sev = SEVERITY_META[incident.severity];
              const SevIcon = sev.icon;
              const elapsed = Math.max(0, state.currentTick - incident.detectedTick);
              return (
                <motion.div
                  key={incident.id}
                  layout
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setSelectedNode({ id: incident.towerId, type: 'tower' })}
                  className={incident.severity === 'critical' ? 'animate-pulse-glow' : ''}
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
                          {sev.label} — {incident.towerId}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Detected {incident.detectedTimestamp.split(' ')[1] ?? incident.detectedTimestamp}
                          {incident.weather ? ` · ${incident.weather}` : ''}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      {elapsed}m
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', fontFamily: 'monospace' }}>
                    {incident.severity === 'critical'
                      ? `AI rerouting traffic from ${incident.towerId} to adjacent towers`
                      : 'No rerouting triggered — monitoring elevated load'}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AlertsIncidentsPanel;
