import React, { useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useSimulation } from '../context/SimulationContext';
import { FiShield, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const HealthGauge: React.FC = () => {
  const { state } = useSimulation();
  const score = state.healthData?.network_health_score ?? 50;

  const { color, label, bgColor, borderColor } = useMemo(() => {
    if (score >= 70) return {
      color: '#34d399',
      label: 'Healthy',
      bgColor: 'rgba(52, 211, 153, 0.12)',
      borderColor: 'rgba(52, 211, 153, 0.3)',
    };
    if (score >= 40) return {
      color: '#fbbf24',
      label: 'Warning',
      bgColor: 'rgba(251, 191, 36, 0.12)',
      borderColor: 'rgba(251, 191, 36, 0.3)',
    };
    return {
      color: '#f87171',
      label: 'Critical',
      bgColor: 'rgba(248, 113, 113, 0.12)',
      borderColor: 'rgba(248, 113, 113, 0.3)',
    };
  }, [score]);

  const baselineScore = state.healthHistory[0]?.network_health_score ?? score;
  const delta = score - baselineScore;

  const scoreMotion = useMotionValue(score);
  const scoreDisplay = useTransform(scoreMotion, (latest) => `${latest.toFixed(0)}%`);

  useEffect(() => {
    const controls = animate(scoreMotion, score, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [score, scoreMotion]);

  return (
    <div className="w-full px-3 py-2 flex items-center justify-between gap-3">
      {/* Icon & Title */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
          style={{ backgroundColor: bgColor, borderColor: borderColor, color: color }}
        >
          <FiShield className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Network Health</span>
          <div className="flex items-center gap-1.5">
            <motion.span
              className="text-base font-extrabold tracking-tight"
              style={{ color }}
            >
              {scoreDisplay}
            </motion.span>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider"
              style={{ backgroundColor: bgColor, borderColor: borderColor, color: color }}
            >
              {label}
            </span>
          </div>
        </div>
      </div>

      {/* Compact Horizontal Progress Bar */}
      <div className="flex-1 max-w-[140px] flex flex-col gap-1">
        <div className="h-2 w-full bg-slate-950/80 border border-slate-800/80 rounded-full overflow-hidden p-0.5 shadow-inner">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Delta trend */}
      {Math.abs(delta) >= 0.1 && (
        <div className="flex items-center gap-1 text-[10px] font-semibold shrink-0" style={{ color: delta >= 0 ? '#34d399' : '#f87171' }}>
          {delta >= 0 ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
          <span>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};

export default HealthGauge;
