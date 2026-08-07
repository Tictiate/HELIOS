import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';

const HealthGauge: React.FC = () => {
  const { state } = useSimulation();
  const score = state.healthData?.network_health_score ?? 50;
  const { color, label, glowColor } = useMemo(() => {
    if (score >= 70) return { color: '#34d399', label: 'Healthy', glowColor: 'rgba(52, 211, 153, 0.4)' };
    if (score >= 40) return { color: '#fbbf24', label: 'Warning', glowColor: 'rgba(251, 191, 36, 0.4)' };
    return { color: '#f87171', label: 'Critical', glowColor: 'rgba(248, 113, 113, 0.4)' };
  }, [score]);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <svg width="170" height="170" viewBox="0 0 180 180" style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}>
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="10" />
        <defs><linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} /><stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient></defs>
        <circle cx="90" cy="90" r={radius} fill="none" stroke="url(#gaugeGradient)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashOffset} transform="rotate(-90 90 90)"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease' }} />
        <text x="90" y="82" textAnchor="middle" fill={color} fontSize="32" fontWeight="700"
          style={{ transition: 'fill 0.5s ease', fontFamily: 'Inter, sans-serif' }}>{score.toFixed(0)}</text>
        <text x="90" y="104" textAnchor="middle" fill="rgba(148, 163, 184, 0.7)" fontSize="11" fontWeight="500"
          style={{ fontFamily: 'Inter, sans-serif' }}>{label}</text>
      </svg>
      <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', fontWeight: 500 }}>NETWORK HEALTH</span>
    </div>
  );
};

export default HealthGauge;
