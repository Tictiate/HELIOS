import React from 'react';
import { useSimulation } from '../context/SimulationContext';

const EdgeServerPanel: React.FC = () => {
  const { state } = useSimulation();

  return (
    <div className="glass-card-static h-full flex flex-col overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '14px' }}>🖥</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Edge Compute
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {['E1', 'E2', 'E3', 'E4'].map((edgeId) => {
          const edge = state.edgeData.get(edgeId);
          if (!edge) return null;

          return (
            <div key={edgeId} className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
              <div className="flex justify-between items-center mb-2">
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)' }}>{edgeId}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{edge.requests_per_min} req/m</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '24px' }}>CPU</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full transition-all duration-300" style={{ width: `${edge.cpu_pct}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '24px' }}>GPU</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full transition-all duration-300" style={{ width: `${edge.gpu_pct}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '24px' }}>MEM</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full transition-all duration-300" style={{ width: `${edge.memory_pct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EdgeServerPanel;
