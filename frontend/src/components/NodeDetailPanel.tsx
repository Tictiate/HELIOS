import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';

interface MetricRowProps {
  label: string;
  value: string;
  barPercent?: number;
  barColor?: string;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, barPercent, barColor }) => (
  <div className="detail-metric">
    <div className="flex-1">
      <div className="flex justify-between items-center">
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        <span
          key={value}
          className="animate-value-update"
          style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </span>
      </div>
      {barPercent !== undefined && (
        <div className="metric-bar">
          <div
            className="metric-bar-fill"
            style={{
              width: `${Math.min(100, Math.max(0, barPercent))}%`,
              background: barColor || 'var(--accent-cyan)',
            }}
          />
        </div>
      )}
    </div>
  </div>
);

function getBarColor(pct: number): string {
  if (pct < 40) return '#34d399';
  if (pct < 70) return '#fbbf24';
  return '#f87171';
}

const NodeDetailPanel: React.FC = () => {
  const { selectedNode, state, setSelectedNode } = useSimulation();

  const content = useMemo(() => {
    if (!selectedNode) return null;
    const { id, type } = selectedNode;

    if (type === 'tower') {
      const tower = state.towerData.get(id);
      const traffic = state.trafficData.get(id);
      const failure = state.failureData.get(id);
      if (!tower) return null;

      const utilization = Math.min(100, Math.max(0, 100 - tower.available_bandwidth_mbps));
      const failProb = failure ? (failure.failed === 1 ? 100 : Math.min(100, failure.cpu_usage_pct * 0.5 + (failure.temperature_c > 50 ? 30 : 0))) : 0;

      return (
        <>
          <MetricRow label="Users" value={tower.users.toString()} barPercent={(tower.users / 2000) * 100} barColor="var(--accent-blue)" />
          <MetricRow label="Bandwidth" value={`${tower.available_bandwidth_mbps.toFixed(1)} Mbps`} barPercent={tower.available_bandwidth_mbps} barColor={getBarColor(100 - tower.available_bandwidth_mbps)} />
          <MetricRow label="Latency" value={`${tower.latency_ms.toFixed(1)} ms`} barPercent={(tower.latency_ms / 60) * 100} barColor={getBarColor((tower.latency_ms / 60) * 100)} />
          <MetricRow label="Packet Loss" value={`${tower.packet_loss_pct.toFixed(2)}%`} barPercent={tower.packet_loss_pct * 20} barColor={getBarColor(tower.packet_loss_pct * 20)} />
          <MetricRow label="Power Usage" value={`${tower.power_usage_pct.toFixed(1)}%`} barPercent={tower.power_usage_pct} barColor={getBarColor(tower.power_usage_pct)} />
          <MetricRow label="Temperature" value={`${tower.temperature_c.toFixed(1)}°C`} barPercent={(tower.temperature_c / 80) * 100} barColor={getBarColor((tower.temperature_c / 80) * 100)} />
          <MetricRow label="Utilization" value={`${utilization.toFixed(0)}%`} barPercent={utilization} barColor={getBarColor(utilization)} />
          <MetricRow label="Failure Risk" value={`${failProb.toFixed(0)}%`} barPercent={failProb} barColor={failProb > 50 ? '#f87171' : failProb > 25 ? '#fbbf24' : '#34d399'} />
          {traffic && (
            <>
              <div style={{ marginTop: '12px', marginBottom: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Traffic Breakdown
              </div>
              <MetricRow label="📹 Video" value={traffic.video_users.toString()} barPercent={(traffic.video_users / 700) * 100} barColor="#a78bfa" />
              <MetricRow label="📞 Voice" value={traffic.voice_users.toString()} barPercent={(traffic.voice_users / 400) * 100} barColor="#3b82f6" />
              <MetricRow label="📡 IoT" value={traffic.iot_devices.toString()} barPercent={(traffic.iot_devices / 1200) * 100} barColor="#22d3ee" />
              <MetricRow label="🎮 Gaming" value={traffic.gaming_users.toString()} barPercent={(traffic.gaming_users / 300) * 100} barColor="#fbbf24" />
              <MetricRow label="🚨 Emergency" value={traffic.emergency_users.toString()} barPercent={(traffic.emergency_users / 20) * 100} barColor="#f87171" />
            </>
          )}
        </>
      );
    }

    if (type === 'edge') {
      const edge = state.edgeData.get(id);
      if (!edge) return null;
      return (
        <>
          <MetricRow label="CPU" value={`${edge.cpu_pct.toFixed(1)}%`} barPercent={edge.cpu_pct} barColor={getBarColor(edge.cpu_pct)} />
          <MetricRow label="GPU" value={`${edge.gpu_pct.toFixed(1)}%`} barPercent={edge.gpu_pct} barColor={getBarColor(edge.gpu_pct)} />
          <MetricRow label="Memory" value={`${edge.memory_pct.toFixed(1)}%`} barPercent={edge.memory_pct} barColor={getBarColor(edge.memory_pct)} />
          <MetricRow label="Requests/min" value={edge.requests_per_min.toString()} barPercent={(edge.requests_per_min / 8000) * 100} barColor="var(--accent-blue)" />
          <MetricRow label="Latency" value={`${edge.latency_ms.toFixed(1)} ms`} barPercent={(edge.latency_ms / 15) * 100} barColor={getBarColor((edge.latency_ms / 15) * 100)} />
        </>
      );
    }

    if (type === 'critical') {
      return (
        <div style={{ padding: '16px 0' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="indicator-dot green" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-green)' }}>Connected</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Critical infrastructure node with priority routing enabled.
            Connected to towers T3, T5, T7 with redundant failover paths.
          </p>
          <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Linked Towers
          </div>
          <div className="flex gap-2 mt-2">
            {['T3', 'T5', 'T7'].map((t) => (
              <span key={t} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', fontSize: '11px', fontWeight: 600 }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (type === 'core') {
      return (
        <div style={{ padding: '16px 0' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="indicator-dot green" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-green)' }}>Operational</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Central core network hub connecting all 10 towers with backbone links.
            AI-driven traffic management active.
          </p>
        </div>
      );
    }

    return (
      <div style={{ padding: '16px 0' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          User cluster connected to local tower.
        </p>
      </div>
    );
  }, [selectedNode, state.towerData, state.trafficData, state.failureData, state.edgeData]);

  if (!selectedNode) {
    return (
      <div className="glass-card-static h-full flex flex-col items-center justify-center p-6" style={{ minWidth: '280px' }}>
        <span style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>📡</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>
          Click a node on the topology to view its details
        </span>
      </div>
    );
  }

  const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
    tower: { label: 'Tower', color: '#3b82f6', icon: '📡' },
    edge: { label: 'Edge Server', color: '#34d399', icon: '🖥' },
    critical: { label: 'Critical Infra', color: '#f87171', icon: '🏥' },
    core: { label: 'Core Network', color: '#fb923c', icon: '🌐' },
    user: { label: 'User Cluster', color: '#64748b', icon: '👥' },
  };

  const typeInfo = typeLabels[selectedNode.type] || typeLabels.user;

  return (
    <div className="glass-card-static h-full flex flex-col animate-slide-in-right overflow-hidden" style={{ minWidth: '280px' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '16px' }}>{typeInfo.icon}</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {selectedNode.id}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: typeInfo.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {typeInfo.label}
            </div>
          </div>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
          }}
        >
          ✕
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {content}
      </div>
    </div>
  );
};

export default NodeDetailPanel;
