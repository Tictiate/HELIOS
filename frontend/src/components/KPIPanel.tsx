import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';

interface KPICardProps {
  title: string;
  value: string;
  unit: string;
  status: 'green' | 'yellow' | 'red';
  icon: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, unit, status, icon }) => (
  <div className="kpi-card">
    <div className="flex items-center justify-between mb-2">
      <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </span>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: '14px' }}>{icon}</span>
        <span className={`indicator-dot ${status}`} />
      </div>
    </div>
    <div className="flex items-baseline gap-1">
      <span
        key={value}
        className="animate-value-update"
        style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </span>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{unit}</span>
    </div>
  </div>
);

function getStatus(value: number, thresholds: [number, number]): 'green' | 'yellow' | 'red' {
  if (value <= thresholds[0]) return 'green';
  if (value <= thresholds[1]) return 'yellow';
  return 'red';
}

function getStatusInverse(value: number, thresholds: [number, number]): 'green' | 'yellow' | 'red' {
  if (value >= thresholds[1]) return 'green';
  if (value >= thresholds[0]) return 'yellow';
  return 'red';
}

const KPIPanel: React.FC = () => {
  const { state } = useSimulation();
  const h = state.healthData;

  const cards = useMemo((): KPICardProps[] => {
    if (!h) {
      return [
        { title: 'Health Score', value: '--', unit: '', status: 'green', icon: '💚' },
        { title: 'Latency', value: '--', unit: 'ms', status: 'green', icon: '⚡' },
        { title: 'Packet Loss', value: '--', unit: '%', status: 'green', icon: '📡' },
        { title: 'Bandwidth', value: '--', unit: 'Mbps', status: 'green', icon: '📶' },
        { title: 'Power Usage', value: '--', unit: '%', status: 'green', icon: '🔋' },
        { title: 'Availability', value: '--', unit: '%', status: 'green', icon: '✅' },
      ];
    }

    // Compute avg bandwidth from towers
    let avgBw = 0;
    let towerCount = 0;
    state.towerData.forEach((t) => {
      avgBw += t.available_bandwidth_mbps;
      towerCount++;
    });
    if (towerCount > 0) avgBw /= towerCount;

    return [
      {
        title: 'Health Score',
        value: h.network_health_score.toFixed(1),
        unit: '/100',
        status: getStatusInverse(h.network_health_score, [40, 70]),
        icon: '💚',
      },
      {
        title: 'Latency',
        value: h.latency_ms.toFixed(1),
        unit: 'ms',
        status: getStatus(h.latency_ms, [20, 40]),
        icon: '⚡',
      },
      {
        title: 'Packet Loss',
        value: h.packet_loss_pct.toFixed(2),
        unit: '%',
        status: getStatus(h.packet_loss_pct, [2, 4]),
        icon: '📡',
      },
      {
        title: 'Bandwidth',
        value: avgBw.toFixed(1),
        unit: 'Mbps',
        status: getStatusInverse(avgBw, [40, 70]),
        icon: '📶',
      },
      {
        title: 'Power Usage',
        value: h.energy_usage_pct.toFixed(1),
        unit: '%',
        status: getStatus(h.energy_usage_pct, [60, 80]),
        icon: '🔋',
      },
      {
        title: 'Availability',
        value: h.availability_pct.toFixed(1),
        unit: '%',
        status: getStatusInverse(h.availability_pct, [95, 98]),
        icon: '✅',
      },
    ];
  }, [h, state.towerData]);

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <KPICard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default KPIPanel;
