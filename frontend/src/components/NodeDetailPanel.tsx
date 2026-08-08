import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FiShare2 } from 'react-icons/fi';
import { useSimulation } from '../context/SimulationContext';

/**
 * Always-compact sidebar slot — stays this size whether or not a node is selected. Clicking a
 * topology node opens the full detail view in `NodeInspector` (a large overlay), not inline
 * here; this keeps the sidebar from being permanently crowded by a tabbed detail panel that's
 * only needed occasionally. See NodeInspector.tsx for the expanded view.
 */
const NodeDetailPanel: React.FC = () => {
  const { selectedNode, setSelectedNode } = useSimulation();
  const reduceMotion = useReducedMotion();

  return (
    <div className="glass-card-static h-full flex flex-col items-center justify-center p-6 text-center" style={{ minWidth: '280px' }}>
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={reduceMotion ? undefined : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'relative', marginBottom: 16 }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.12), transparent 70%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FiShare2 style={{ width: 26, height: 26, color: 'var(--accent-cyan)', opacity: 0.7 }} />
        </div>
      </motion.div>
      {selectedNode ? (
        <>
          <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>
            Inspecting {selectedNode.id}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '6px', lineHeight: 1.5, maxWidth: '220px' }}>
            Full details are open in the inspector panel.
          </span>
          <button
            onClick={() => setSelectedNode(null)}
            className="timeline-btn"
            style={{ marginTop: 14, padding: '4px 12px' }}
          >
            Close Inspector
          </button>
        </>
      ) : (
        <>
          <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>
            Select a node to inspect network details
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '6px', lineHeight: 1.5, maxWidth: '220px' }}>
            Click any tower, edge server, or infrastructure node on the topology to view live telemetry.
          </span>
        </>
      )}
    </div>
  );
};

export default NodeDetailPanel;
