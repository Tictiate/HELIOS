import React from 'react';
import { FiServer } from 'react-icons/fi';
import { useSimulation } from '../context/SimulationContext';

const BARS: { key: 'cpu_pct' | 'gpu_pct' | 'memory_pct'; label: string; color: string }[] = [
  { key: 'cpu_pct', label: 'CPU', color: '#22d3ee' },
  { key: 'gpu_pct', label: 'GPU', color: '#a78bfa' },
  { key: 'memory_pct', label: 'MEM', color: '#3b82f6' },
];

const EdgeServerPanel: React.FC = () => {
  const { state } = useSimulation();

  return (
    <div className="glass-card-static h-full flex flex-col overflow-hidden">
      <div className="panel-header">
        <FiServer className="icon icon-sm" style={{ color: 'var(--accent-green)' }} />
        <span className="label-caps">Edge Compute</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        {['E1', 'E2', 'E3', 'E4'].map((edgeId) => {
          const edge = state.edgeData.get(edgeId);
          if (!edge) return null;

          return (
            <div
              key={edgeId}
              className="rounded-lg p-3 transition-colors duration-200"
              style={{ background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(148, 163, 184, 0.08)' }}
            >
              <div className="flex justify-between items-center mb-2.5">
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '0.02em' }}>{edgeId}</span>
                <span className="text-caption" style={{ fontSize: '10px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {edge.requests_per_min.toLocaleString()} req/m
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {BARS.map(({ key, label, color }) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="label-caps-sm" style={{ width: '26px', letterSpacing: 0 }}>{label}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148, 163, 184, 0.1)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${edge[key]}%`, background: color, boxShadow: `0 0 6px ${color}66` }}
                      />
                    </div>
                    <span className="text-caption" style={{ fontSize: '10px', width: '30px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
                      {edge[key].toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EdgeServerPanel;
