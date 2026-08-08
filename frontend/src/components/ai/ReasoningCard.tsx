import React from 'react';
import { motion } from 'framer-motion';
import { FiHelpCircle } from 'react-icons/fi';

interface ReasoningCardProps {
  reasoning: string;
}

export const ReasoningCard: React.FC<ReasoningCardProps> = ({ reasoning }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-4 border border-purple-500/40 bg-gradient-to-b from-purple-950/25 via-slate-900/90 to-slate-950/95 shadow-xl backdrop-blur-md relative overflow-hidden"
      style={{
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px rgba(168, 85, 247, 0.12)',
      }}
    >
      {/* Ultra-thin 2px top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/80">
        <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner shrink-0">
          <FiHelpCircle className="w-3.5 h-3.5" />
        </div>
        <div>
          <h4 className="text-[11px] font-extrabold text-purple-300 uppercase tracking-wider">Why this strategy?</h4>
          <p className="text-[9px] text-slate-400 font-medium">Explainable AI (XAI) Rationale</p>
        </div>
      </div>

      {/* Reasoning Content Box */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-200 leading-relaxed font-normal shadow-inner">
        {reasoning}
      </div>
    </motion.div>
  );
};

export default ReasoningCard;
