import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';

export interface ProblemData {
  title: string;
  description: string;
  prediction_confidence: number;
  affected_users: number;
}

interface ProblemCardProps {
  problem: ProblemData;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-4 border border-amber-500/45 bg-gradient-to-b from-amber-950/25 via-slate-900/90 to-slate-950/95 shadow-xl backdrop-blur-md relative overflow-hidden"
      style={{
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px rgba(245, 158, 11, 0.12)',
      }}
    >
      {/* Ultra-thin 2px top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/80">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
          <FiAlertTriangle className="w-3.5 h-3.5" />
        </div>
        <div>
          <h4 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">{problem.title || 'Problem Detected'}</h4>
          <p className="text-[9px] text-slate-400 font-medium">Predictive Anomaly & Congestion Analysis</p>
        </div>
      </div>

      {/* Problem Description Panel */}
      <div className="bg-slate-950/80 rounded-xl p-2.5 mb-2.5 border border-slate-800/80 shadow-inner">
        <p className="text-[11px] text-slate-200 leading-relaxed font-normal">
          {problem.description}
        </p>
      </div>

      {/* Metric badges */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="bg-slate-950/70 rounded-xl p-2 border border-slate-800/80 flex items-center justify-between shadow-sm hover:border-amber-500/40 transition-all">
          <div className="flex items-center gap-1.5 text-slate-400 text-[9px] uppercase font-bold tracking-wider">
            <FiTrendingUp className="text-amber-400 w-3 h-3" />
            <span>Confidence</span>
          </div>
          <span className="font-extrabold text-amber-400 text-[11px]">{problem.prediction_confidence}%</span>
        </div>

        <div className="bg-slate-950/70 rounded-xl p-2 border border-slate-800/80 flex items-center justify-between shadow-sm hover:border-orange-500/40 transition-all">
          <div className="flex items-center gap-1.5 text-slate-400 text-[9px] uppercase font-bold tracking-wider">
            <FiUsers className="text-orange-400 w-3 h-3" />
            <span>Affected</span>
          </div>
          <span className="font-extrabold text-orange-400 text-[11px]">{problem.affected_users.toLocaleString()} Users</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProblemCard;
