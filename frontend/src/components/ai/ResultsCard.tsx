import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiActivity, FiShield, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

export interface ResultsData {
  latency_before: number;
  latency_after: number;
  health_before: number;
  health_after: number;
  confidence: number;
}

interface ResultsCardProps {
  results: ResultsData;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ results }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-4 border border-emerald-500/40 bg-gradient-to-b from-emerald-950/25 via-slate-900/90 to-slate-950/95 shadow-xl backdrop-blur-md relative overflow-hidden"
      style={{
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px rgba(52, 211, 153, 0.12)',
      }}
    >
      {/* Ultra-thin 2px top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/80">
        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
          <FiTrendingUp className="w-3.5 h-3.5" />
        </div>
        <div>
          <h4 className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider">Predicted Results</h4>
          <p className="text-[9px] text-slate-400 font-medium">Digital Twin Performance Forecast</p>
        </div>
      </div>

      {/* Metrics List */}
      <div className="grid grid-cols-1 gap-2 text-xs">
        {/* Latency metric */}
        <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between shadow-sm hover:border-cyan-500/40 transition-all">
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-semibold">
            <div className="w-5 h-5 rounded-md bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FiActivity className="w-3 h-3" />
            </div>
            <span>Latency</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-[11px]">
            <span className="text-slate-400 line-through text-[10px] font-normal">{results.latency_before} ms</span>
            <FiArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="text-cyan-300 font-extrabold text-[11px] px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30">
              {results.latency_after} ms
            </span>
          </div>
        </div>

        {/* Network Health metric */}
        <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between shadow-sm hover:border-emerald-500/40 transition-all">
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-semibold">
            <div className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FiShield className="w-3 h-3" />
            </div>
            <span>Network Health</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-[11px]">
            <span className="text-slate-400 line-through text-[10px] font-normal">{results.health_before}</span>
            <FiArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-emerald-300 font-extrabold text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
              {results.health_after}
            </span>
          </div>
        </div>

        {/* Confidence metric */}
        <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between shadow-sm hover:border-purple-500/40 transition-all">
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-semibold">
            <div className="w-5 h-5 rounded-md bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FiCheckCircle className="w-3 h-3" />
            </div>
            <span>Confidence</span>
          </div>
          <span className="text-purple-300 font-extrabold text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30">
            {results.confidence}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsCard;
