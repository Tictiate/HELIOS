import React, { useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
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

  const baselineScore = state.healthHistory[0]?.network_health_score ?? score;
  const delta = score - baselineScore;

  const scoreMotion = useMotionValue(score);
  const scoreDisplay = useTransform(scoreMotion, (latest) => latest.toFixed(0));
  useEffect(() => {
    const controls = animate(scoreMotion, score, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [score, scoreMotion]);

  return (
    <div className="flex flex-col items-center justify-center py-1">
      <svg width="128" height="128" viewBox="0 0 180 180" style={{ filter: `drop-shadow(0 0 14px ${glowColor})` }}>
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="10" />
        <defs><linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} /><stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient></defs>
        <circle cx="90" cy="90" r={radius} fill="none" stroke="url(#gaugeGradient)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashOffset} transform="rotate(-90 90 90)"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease' }} />
        <motion.text x="90" y="82" textAnchor="middle" fill={color} fontSize="34" fontWeight="700"
          style={{ transition: 'fill 0.5s ease', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>{scoreDisplay}</motion.text>
        <text x="90" y="105" textAnchor="middle" fill="rgba(148, 163, 184, 0.75)" fontSize="11" fontWeight="600"
          style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</text>
      </svg>
      <span className="label-caps-sm" style={{ marginTop: '2px' }}>Network Health</span>
      {Math.abs(delta) >= 0.1 && (
        <span style={{ fontSize: '10px', fontWeight: 600, marginTop: '2px', color: delta >= 0 ? '#34d399' : '#f87171' }}>
          {delta >= 0 ? '+' : ''}{delta.toFixed(1)}% vs last hour
        </span>
      )}
    </div>
  );
};

export default HealthGauge;
