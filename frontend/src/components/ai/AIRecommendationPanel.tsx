import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';
import { useSimulation } from '../../context/SimulationContext';

/**
 * Reserved surface for the not-yet-built Explainable AI module (see PROJECT_STATE.md /
 * docs/frontend/COMPONENT_LIBRARY.md "AI Components"). Content is intentionally static —
 * there is no model behind this yet, so we label it clearly rather than fabricate reasoning.
 */
const AIRecommendationPanel: React.FC = () => {
  const { selectedNode } = useSimulation();

  return (
    <div className="glass-card-static flex flex-col overflow-hidden" style={{ minWidth: '280px' }}>
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2.5">
          <FiCpu className="icon icon-sm" style={{ color: 'var(--accent-purple, #a78bfa)' }} />
          <span className="label-caps">
            AI Recommendation{selectedNode ? ` — ${selectedNode.id}` : ''}
          </span>
        </div>
        <span className="panel-badge" style={{ color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)', borderColor: 'rgba(167, 139, 250, 0.18)' }}>
          Coming Soon
        </span>
      </div>
      <div className="px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={selectedNode?.id ?? 'network'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}
          >
            {selectedNode
              ? `The explainable-AI engine isn't connected yet — once live, this panel will surface ${selectedNode.id}-specific reasoning and recommended actions here.`
              : 'Select a node to see AI-driven recommendations here once the explainability engine is connected.'}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIRecommendationPanel;
