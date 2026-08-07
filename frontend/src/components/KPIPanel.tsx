import React, { useMemo } from 'react';
import type { IconType } from 'react-icons';
import { FiHeart, FiZap, FiActivity, FiWifi, FiBattery, FiCheckCircle } from 'react-icons/fi';
import { useSimulation } from '../context/SimulationContext';
import AnimatedNumber from './common/AnimatedNumber';

interface KPICardProps {
  title: string;
  value: number | null;
  decimals: number;
  unit: string;
  status: 'green' | 'yellow' | 'red';
  icon: IconType;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, decimals, unit, status, icon: Icon }) => (
  <div className="kpi-card">
    <div className="flex items-center justify-between mb-1.5">
      <span className="label-caps-sm" style={{ fontSize: '9px' }}>{title}</span>
      <div className="flex items-center gap-1.5">
        <Icon className="icon icon-xs" style={{ color: 'var(--text-muted)' }} />
        <span className={`indicator-dot ${status}`} style={{ width: 5, height: 5 }} />
      </div>
    </div>
    <div className="flex items-baseline gap-1">
      {value === null ? (
        <span className="metric-value" style={{ fontSize: '17px' }}>--</span>
      ) : (
        <AnimatedNumber value={value} decimals={decimals} className="metric-value" style={{ fontSize: '17px' }} />
      )}
      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>{unit}</span>
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

  const cards = useMemo((): (Omit<KPICardProps, 'value'> & { value: number | null })[] => {
    if (!h) {
      return [
        { title: 'Health Score', value: null, decimals: 1, unit: '/100', status: 'green', icon: FiHeart },
        { title: 'Latency', value: null, decimals: 1, unit: 'ms', status: 'green', icon: FiZap },
        { title: 'Packet Loss', value: null, decimals: 2, unit: '%', status: 'green', icon: FiActivity },
        { title: 'Bandwidth', value: null, decimals: 1, unit: 'Mbps', status: 'green', icon: FiWifi },
        { title: 'Power Usage', value: null, decimals: 1, unit: '%', status: 'green', icon: FiBattery },
        { title: 'Availability', value: null, decimals: 1, unit: '%', status: 'green', icon: FiCheckCircle },
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
        value: h.network_health_score,
        decimals: 1,
        unit: '/100',
        status: getStatusInverse(h.network_health_score, [40, 70]),
        icon: FiHeart,
      },
      {
        title: 'Latency',
        value: h.latency_ms,
        decimals: 1,
        unit: 'ms',
        status: getStatus(h.latency_ms, [20, 40]),
        icon: FiZap,
      },
      {
        title: 'Packet Loss',
        value: h.packet_loss_pct,
        decimals: 2,
        unit: '%',
        status: getStatus(h.packet_loss_pct, [2, 4]),
        icon: FiActivity,
      },
      {
        title: 'Bandwidth',
        value: avgBw,
        decimals: 1,
        unit: 'Mbps',
        status: getStatusInverse(avgBw, [40, 70]),
        icon: FiWifi,
      },
      {
        title: 'Power Usage',
        value: h.energy_usage_pct,
        decimals: 1,
        unit: '%',
        status: getStatus(h.energy_usage_pct, [60, 80]),
        icon: FiBattery,
      },
      {
        title: 'Availability',
        value: h.availability_pct,
        decimals: 1,
        unit: '%',
        status: getStatusInverse(h.availability_pct, [95, 98]),
        icon: FiCheckCircle,
      },
    ];
  }, [h, state.towerData]);

  return (
    <div className="grid grid-cols-3 gap-2">
      {cards.map((card) => (
        <KPICard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default KPIPanel;
