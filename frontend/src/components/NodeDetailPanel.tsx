import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { IconType } from 'react-icons';
import {
  FiRadio, FiServer, FiShield, FiGlobe, FiUsers, FiX, FiVideo, FiPhoneCall, FiCpu, FiPlay,
  FiAlertTriangle, FiShare2,
} from 'react-icons/fi';
import { useSimulation } from '../context/SimulationContext';
import { getConnectedNodeIds } from '../utils/topology';
import {
  getNodeStatus, getTowerUtilization, getTowerHealthScore, getEdgeHealthScore,
  NODE_STATUS_META, type NodeStatus,
} from '../utils/nodeMetrics';
import type { EventSeverity } from '../types';

type TabId = 'overview' | 'metrics' | 'connections' | 'events';
const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'connections', label: 'Connections' },
  { id: 'events', label: 'Events' },
];

interface MetricRowProps {
  label: React.ReactNode;
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

const TrafficLabel: React.FC<{ icon: IconType; label: string }> = ({ icon: Icon, label }) => (
  <span className="flex items-center gap-1.5">
    <Icon className="icon icon-xs" style={{ color: 'var(--text-muted)' }} />
    {label}
  </span>
);

const StatusBadge: React.FC<{ status: NodeStatus }> = ({ status }) => {
  const meta = NODE_STATUS_META[status];
  return (
    <span
      className="flex items-center gap-1.5"
      style={{
        fontSize: '10px', fontWeight: 700, color: meta.color, background: `${meta.color}1a`,
        border: `1px solid ${meta.color}33`, padding: '3px 8px', borderRadius: '10px',
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}
    >
      <span className={`indicator-dot ${status === 'operational' ? 'green' : status === 'degraded' ? 'yellow' : 'red'}`} style={{ width: 5, height: 5 }} />
      {meta.label}
    </span>
  );
};

const StatTile: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="stat-tile">
    <div className="label-caps-sm" style={{ letterSpacing: 0, marginBottom: 3 }}>{label}</div>
    <div className="metric-value" style={{ fontSize: '15px' }}>{value}</div>
  </div>
);

const EmptyTabState: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center justify-center" style={{ padding: '24px 0', color: 'var(--text-muted)', fontSize: '11px' }}>
    {text}
  </div>
);

const SEVERITY_DOT: Record<EventSeverity, string> = { info: 'blue', warning: 'yellow', critical: 'red', success: 'green' };

function getBarColor(pct: number): string {
  if (pct < 40) return '#34d399';
  if (pct < 70) return '#fbbf24';
  return '#f87171';
}

const NodeDetailPanel: React.FC = () => {
  const { selectedNode, state, setSelectedNode, events } = useSimulation();
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => { setActiveTab('overview'); }, [selectedNode?.id]);

  const meta = useMemo(() => {
    if (!selectedNode) return null;
    const { id, type } = selectedNode;

    if (type === 'tower') {
      const tower = state.towerData.get(id);
      if (!tower) return null;
      const failure = state.failureData.get(id);
      const failed = failure?.failed === 1;
      const utilization = getTowerUtilization(tower);
      return { status: getNodeStatus(failed, utilization), health: getTowerHealthScore(tower, failure) };
    }
    if (type === 'edge') {
      const edge = state.edgeData.get(id);
      if (!edge) return null;
      const avgLoad = (edge.cpu_pct + edge.gpu_pct + edge.memory_pct) / 3;
      return { status: getNodeStatus(false, avgLoad), health: getEdgeHealthScore(edge) };
    }
    if (type === 'core') {
      const h = state.healthData;
      if (!h) return null;
      return { status: getNodeStatus(false, 100 - h.network_health_score), health: Math.round(h.network_health_score) };
    }
    if (type === 'critical') {
      const linkedTowers = getConnectedNodeIds(id).filter((n) => state.towerData.has(n));
      const anyFailed = linkedTowers.some((t) => state.failureData.get(t)?.failed === 1);
      const avgUtil = linkedTowers.length
        ? linkedTowers.reduce((sum, t) => sum + getTowerUtilization(state.towerData.get(t)!), 0) / linkedTowers.length
        : 0;
      return { status: getNodeStatus(anyFailed, avgUtil), health: anyFailed ? 12 : Math.round(100 - avgUtil) };
    }
    return null;
  }, [selectedNode, state.towerData, state.failureData, state.edgeData, state.healthData]);

  const connectedNodes = useMemo(
    () => (selectedNode ? getConnectedNodeIds(selectedNode.id) : []),
    [selectedNode]
  );

  const nodeAlerts = useMemo(
    () => (selectedNode ? events.filter((e) => e.nodeId === selectedNode.id).slice(-8).reverse() : []),
    [events, selectedNode]
  );

  const overviewStats = useMemo((): { label: string; value: string }[] => {
    if (!selectedNode || !meta) return [];
    const { id, type } = selectedNode;

    if (type === 'tower') {
      const tower = state.towerData.get(id);
      if (!tower) return [];
      return [
        { label: 'Health', value: `${meta.health}/100` },
        { label: 'Users', value: tower.users.toLocaleString() },
        { label: 'Latency', value: `${tower.latency_ms.toFixed(1)} ms` },
        { label: 'Bandwidth', value: `${tower.available_bandwidth_mbps.toFixed(1)} Mbps` },
        { label: 'Power', value: `${tower.power_usage_pct.toFixed(0)}%` },
        { label: 'Load', value: `${getTowerUtilization(tower).toFixed(0)}%` },
      ];
    }
    if (type === 'edge') {
      const edge = state.edgeData.get(id);
      if (!edge) return [];
      return [
        { label: 'Health', value: `${meta.health}/100` },
        { label: 'CPU', value: `${edge.cpu_pct.toFixed(0)}%` },
        { label: 'GPU', value: `${edge.gpu_pct.toFixed(0)}%` },
        { label: 'Memory', value: `${edge.memory_pct.toFixed(0)}%` },
        { label: 'Requests/min', value: edge.requests_per_min.toLocaleString() },
        { label: 'Latency', value: `${edge.latency_ms.toFixed(1)} ms` },
      ];
    }
    if (type === 'core') {
      const h = state.healthData;
      return [
        { label: 'Health', value: `${meta.health}/100` },
        { label: 'Towers', value: `${connectedNodes.length}` },
        { label: 'Availability', value: h ? `${h.availability_pct.toFixed(1)}%` : '—' },
      ];
    }
    if (type === 'critical') {
      return [
        { label: 'Health', value: `${meta.health}/100` },
        { label: 'Linked Towers', value: `${connectedNodes.length}` },
      ];
    }
    return [];
  }, [selectedNode, meta, state.towerData, state.edgeData, state.healthData, connectedNodes.length]);

  const content = useMemo(() => {
    if (!selectedNode) return null;
    const { id, type } = selectedNode;

    if (type === 'tower') {
      const tower = state.towerData.get(id);
      const traffic = state.trafficData.get(id);
      const failure = state.failureData.get(id);
      if (!tower) return null;

      const utilization = getTowerUtilization(tower);
      const failProb = failure ? (failure.failed === 1 ? 100 : Math.min(100, failure.cpu_usage_pct * 0.5 + (failure.temperature_c > 50 ? 30 : 0))) : 0;

      return (
        <>
          <MetricRow label="Connected Users" value={tower.users.toString()} barPercent={(tower.users / 2000) * 100} barColor="var(--accent-blue)" />
          <MetricRow label="Bandwidth" value={`${tower.available_bandwidth_mbps.toFixed(1)} Mbps`} barPercent={tower.available_bandwidth_mbps} barColor={getBarColor(100 - tower.available_bandwidth_mbps)} />
          <MetricRow label="Latency" value={`${tower.latency_ms.toFixed(1)} ms`} barPercent={(tower.latency_ms / 60) * 100} barColor={getBarColor((tower.latency_ms / 60) * 100)} />
          <MetricRow label="Packet Loss" value={`${tower.packet_loss_pct.toFixed(2)}%`} barPercent={tower.packet_loss_pct * 20} barColor={getBarColor(tower.packet_loss_pct * 20)} />
          <MetricRow label="Power Usage" value={`${tower.power_usage_pct.toFixed(1)}%`} barPercent={tower.power_usage_pct} barColor={getBarColor(tower.power_usage_pct)} />
          <MetricRow label="Temperature" value={`${tower.temperature_c.toFixed(1)}°C`} barPercent={(tower.temperature_c / 80) * 100} barColor={getBarColor((tower.temperature_c / 80) * 100)} />
          <MetricRow label="Utilization" value={`${utilization.toFixed(0)}%`} barPercent={utilization} barColor={getBarColor(utilization)} />
          <MetricRow label="Failure Risk" value={`${failProb.toFixed(0)}%`} barPercent={failProb} barColor={failProb > 50 ? '#f87171' : failProb > 25 ? '#fbbf24' : '#34d399'} />
          {traffic && (
            <>
              <div className="label-caps-sm" style={{ marginTop: '14px', marginBottom: '6px' }}>
                Traffic Breakdown
              </div>
              <MetricRow label={<TrafficLabel icon={FiVideo} label="Video" />} value={traffic.video_users.toString()} barPercent={(traffic.video_users / 700) * 100} barColor="#a78bfa" />
              <MetricRow label={<TrafficLabel icon={FiPhoneCall} label="Voice" />} value={traffic.voice_users.toString()} barPercent={(traffic.voice_users / 400) * 100} barColor="#3b82f6" />
              <MetricRow label={<TrafficLabel icon={FiCpu} label="IoT" />} value={traffic.iot_devices.toString()} barPercent={(traffic.iot_devices / 1200) * 100} barColor="#22d3ee" />
              <MetricRow label={<TrafficLabel icon={FiPlay} label="Gaming" />} value={traffic.gaming_users.toString()} barPercent={(traffic.gaming_users / 300) * 100} barColor="#fbbf24" />
              <MetricRow label={<TrafficLabel icon={FiAlertTriangle} label="Emergency" />} value={traffic.emergency_users.toString()} barPercent={(traffic.emergency_users / 20) * 100} barColor="#f87171" />
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
        <div style={{ padding: '16px 0 4px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Critical infrastructure node with priority routing enabled. Health is derived from the
            real-time status of its linked towers.
          </p>
        </div>
      );
    }

    if (type === 'core') {
      return (
        <div style={{ padding: '16px 0 4px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Central core network hub connecting all 10 towers with backbone links.
            AI-driven traffic management active.
          </p>
        </div>
      );
    }

    return (
      <div style={{ padding: '16px 0 4px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          User cluster connected to local tower.
        </p>
      </div>
    );
  }, [selectedNode, state.towerData, state.trafficData, state.failureData, state.edgeData]);

  if (!selectedNode) {
    return (
      <div className="glass-card-static h-full flex flex-col items-center justify-center p-6 text-center" style={{ minWidth: '280px' }}>
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={reduceMotion ? undefined : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'relative', marginBottom: 16 }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.12), transparent 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FiShare2 style={{ width: 26, height: 26, color: 'var(--accent-cyan)', opacity: 0.7 }} />
          </div>
        </motion.div>
        <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>
          Select a node to inspect network details
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '6px', lineHeight: 1.5, maxWidth: '220px' }}>
          Click any tower, edge server, or infrastructure node on the topology to view live telemetry.
        </span>
      </div>
    );
  }

  const typeLabels: Record<string, { label: string; color: string; icon: IconType }> = {
    tower: { label: 'Tower', color: '#3b82f6', icon: FiRadio },
    edge: { label: 'Edge Server', color: '#34d399', icon: FiServer },
    critical: { label: 'Critical Infra', color: '#f87171', icon: FiShield },
    core: { label: 'Core Network', color: '#fb923c', icon: FiGlobe },
    user: { label: 'User Cluster', color: '#64748b', icon: FiUsers },
  };

  const typeInfo = typeLabels[selectedNode.type] || typeLabels.user;
  const TypeIcon = typeInfo.icon;

  return (
    <div className="glass-card-static h-full flex flex-col overflow-hidden" style={{ minWidth: '280px' }}>
      {/* Header */}
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2.5">
          <div className="icon icon-md" style={{ color: typeInfo.color }}>
            <TypeIcon className="w-full h-full" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {selectedNode.id}
            </div>
            <div className="label-caps-sm" style={{ color: typeInfo.color, marginTop: '1px' }}>
              {typeInfo.label}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {meta && <StatusBadge status={meta.status} />}
          <button
            onClick={() => setSelectedNode(null)}
            className="icon icon-md"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', transition: 'color var(--dur-base) ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <FiX className="w-full h-full" />
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="node-tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`node-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'connections' && connectedNodes.length > 0 ? ` (${connectedNodes.length})` : ''}
            {tab.id === 'events' && nodeAlerts.length > 0 ? ` (${nodeAlerts.length})` : ''}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedNode.type}-${selectedNode.id}-${activeTab}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'overview' && (
              overviewStats.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {overviewStats.map((s) => <StatTile key={s.label} label={s.label} value={s.value} />)}
                </div>
              ) : <EmptyTabState text="No telemetry available for this node type" />
            )}
            {activeTab === 'metrics' && content}
            {activeTab === 'connections' && (
              connectedNodes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {connectedNodes.map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        const node = state.nodes.find((nn) => nn.node_id === n);
                        setSelectedNode({ id: n, type: node?.node_type ?? (n === 'Control' ? 'core' : n === 'Hospital' ? 'critical' : n.startsWith('U') ? 'user' : n.startsWith('E') ? 'edge' : 'tower') });
                      }}
                      style={{
                        padding: '4px 9px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.12)',
                        border: '1px solid rgba(59, 130, 246, 0.2)', color: 'var(--accent-blue)', fontSize: '11px',
                        fontWeight: 600, cursor: 'pointer', transition: 'background var(--dur-fast) ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.22)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.12)')}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              ) : <EmptyTabState text="No connected nodes" />
            )}
            {activeTab === 'events' && (
              nodeAlerts.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {nodeAlerts.map((a) => (
                    <div key={a.id} className="flex items-start gap-2">
                      <span className={`indicator-dot ${SEVERITY_DOT[a.severity]}`} style={{ marginTop: '4px', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{a.message}</span>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px', fontFamily: 'monospace' }}>{a.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <EmptyTabState text="No recent events for this node" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NodeDetailPanel;
