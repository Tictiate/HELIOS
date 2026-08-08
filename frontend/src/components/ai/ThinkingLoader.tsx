import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';

interface ThinkingLoaderProps {
  label?: string;
}

export const ThinkingLoader: React.FC<ThinkingLoaderProps> = ({ label = 'Thinking...' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 p-3.5 rounded-xl my-1.5"
      style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 0 15px rgba(34, 211, 238, 0.1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
          className="w-7 h-7 rounded-full border-2 border-dashed border-cyan-400/60"
        />
        <FiCpu className="w-3.5 h-3.5 text-cyan-400 absolute" />
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-cyan-300 tracking-wide">{label}</span>
          <span className="flex gap-1">
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"
            />
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"
            />
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"
            />
          </span>
        </div>
        <span className="text-[10px] text-slate-400">HELIOS Neural Pipeline active</span>
      </div>
    </motion.div>
  );
};

export default ThinkingLoader;
