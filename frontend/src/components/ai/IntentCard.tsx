import React from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiUsers, FiZap, FiActivity, FiLayers } from 'react-icons/fi';

export interface IntentData {
  event: string;
  event_display: string;
  goal: string;
  goal_display: string;
  priority: string;
  priority_display: string;
  estimated_users: number;
}

interface IntentCardProps {
  intent: IntentData;
}

export const IntentCard: React.FC<IntentCardProps> = ({ intent }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-4 border border-cyan-500/40 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 shadow-xl backdrop-blur-md relative overflow-hidden"
      style={{
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px rgba(34, 211, 238, 0.1)',
      }}
    >
      {/* Ultra-thin 2px top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/80">
        <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-inner shrink-0">
          <FiLayers className="w-3.5 h-3.5" />
        </div>
        <div>
          <h4 className="text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider">Intent Understood</h4>
          <p className="text-[9px] text-slate-400 font-medium">Structured Operator Objective</p>
        </div>
      </div>

      {/* Grid of parameters */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        {/* Event */}
        <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 flex flex-col gap-1 hover:border-cyan-500/40 transition-all shadow-sm">
          <div className="flex items-center gap-1 text-cyan-400 text-[9px] uppercase font-bold tracking-wider">
            <FiActivity className="w-3 h-3 text-cyan-400" />
            <span>Event</span>
          </div>
          <span className="font-bold text-slate-100 text-[11px] tracking-tight">{intent.event_display}</span>
        </div>

        {/* Goal */}
        <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 flex flex-col gap-1 hover:border-blue-500/40 transition-all shadow-sm">
          <div className="flex items-center gap-1 text-blue-400 text-[9px] uppercase font-bold tracking-wider">
            <FiTarget className="w-3 h-3 text-blue-400" />
            <span>Goal</span>
          </div>
          <span className="font-bold text-slate-100 text-[11px] tracking-tight">{intent.goal_display}</span>
        </div>

        {/* Priority */}
        <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 flex flex-col gap-1 hover:border-purple-500/40 transition-all shadow-sm">
          <div className="flex items-center gap-1 text-purple-400 text-[9px] uppercase font-bold tracking-wider">
            <FiZap className="w-3 h-3 text-purple-400" />
            <span>Priority</span>
          </div>
          <span className="font-bold text-slate-100 text-[11px] tracking-tight">{intent.priority_display}</span>
        </div>

        {/* Estimated Crowd */}
        <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 flex flex-col gap-1 hover:border-emerald-500/40 transition-all shadow-sm">
          <div className="flex items-center gap-1 text-emerald-400 text-[9px] uppercase font-bold tracking-wider">
            <FiUsers className="w-3 h-3 text-emerald-400" />
            <span>Estimated Crowd</span>
          </div>
          <span className="font-extrabold text-emerald-400 text-[11px] tracking-tight">{intent.estimated_users.toLocaleString()} Users</span>
        </div>
      </div>
    </motion.div>
  );
};

export default IntentCard;
