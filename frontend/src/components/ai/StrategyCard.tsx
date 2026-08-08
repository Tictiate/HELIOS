import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiSliders } from 'react-icons/fi';

export interface StrategyData {
  title: string;
  actions: string[];
}

interface StrategyCardProps {
  strategy: StrategyData;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ strategy }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-4 border border-blue-500/40 bg-gradient-to-b from-blue-950/25 via-slate-900/90 to-slate-950/95 shadow-xl backdrop-blur-md relative overflow-hidden"
      style={{
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px rgba(59, 130, 246, 0.12)',
      }}
    >
      {/* Ultra-thin 2px top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-400" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/80">
        <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
          <FiSliders className="w-3.5 h-3.5" />
        </div>
        <div>
          <h4 className="text-[11px] font-extrabold text-blue-300 uppercase tracking-wider">{strategy.title || 'Selected Strategy'}</h4>
          <p className="text-[9px] text-slate-400 font-medium">Autonomous Orchestration Plan</p>
        </div>
      </div>

      {/* Action checkmark list */}
      <div className="flex flex-col gap-2">
        {strategy.actions.map((action, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.07, duration: 0.3 }}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-100 hover:border-blue-500/40 transition-all shadow-sm"
          >
            <div className="w-4 h-4 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <FiCheckCircle className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="font-semibold text-slate-100 text-[11px] tracking-tight">{action}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StrategyCard;
