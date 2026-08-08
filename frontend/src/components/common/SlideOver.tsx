import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  width?: string;
  children: React.ReactNode;
}

/**
 * Shared right-side overlay used for progressive disclosure across the dashboard (Node
 * Inspector, AI Decisions/Alerts "View All", Assistant "Expand Chat") — keeps the always-visible
 * sidebar panels compact while the full detail is one click away.
 */
const SlideOver: React.FC<SlideOverProps> = ({ open, onClose, title, width = '38vw', children }) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="slideover-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="slideover-panel"
            style={{ width }}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="panel-header justify-between" style={{ flexShrink: 0 }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
              <button
                onClick={onClose}
                className="icon icon-md"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                aria-label="Close"
              >
                <FiX className="w-full h-full" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SlideOver;
