import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiZap, FiLoader, FiCheckCircle } from 'react-icons/fi';
import type { NetworkDetail } from '../../services/chatIntent';

export interface AssistantMessageData {
  id: string;
  from: 'user' | 'assistant';
  text: string;
  time: string;
  details?: NetworkDetail[];
  matchedScenario?: string;
}

interface AssistantMessageProps {
  message: AssistantMessageData;
  onTriggerScenario?: (scenario: string) => void;
  triggerState?: 'idle' | 'pending' | 'done';
}

/**
 * Single restrained message renderer — replaces the old always-four-cards-per-message layout.
 * Plain response text is always shown; a "View details" disclosure only renders when there's
 * real structured data to show (network metrics actually used, or a real backend scenario the
 * user can trigger). Casual/info replies render no disclosure at all.
 */
const AssistantMessage: React.FC<AssistantMessageProps> = ({ message, onTriggerScenario, triggerState = 'idle' }) => {
  const [open, setOpen] = useState(false);
  const hasDetails = !!(message.details?.length || message.matchedScenario);

  if (message.from === 'user') {
    return (
      <div className="flex justify-end">
        <div className="chat-bubble user">
          <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.5 }}>{message.text}</p>
          <span style={{ fontSize: '9px', opacity: 0.6, display: 'block', textAlign: 'right', marginTop: 3 }}>{message.time}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start" style={{ maxWidth: '92%' }}>
      <div className="chat-avatar" style={{ marginRight: 8, flexShrink: 0 }}>H</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="chat-bubble assistant">
          <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.55 }}>{message.text}</p>
          <span style={{ fontSize: '9px', opacity: 0.6, display: 'block', marginTop: 4 }}>{message.time}</span>
        </div>

        {hasDetails && (
          <div style={{ marginTop: 6 }}>
            <button
              onClick={() => setOpen((v) => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
                color: 'var(--accent-cyan)', fontSize: '10px', fontWeight: 600, cursor: 'pointer', padding: '2px 0',
              }}
            >
              <FiZap style={{ width: 10, height: 10 }} />
              {message.matchedScenario ? 'View scenario details' : 'View details'}
              <FiChevronDown style={{ width: 10, height: 10, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast) ease' }} />
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    style={{
                      marginTop: 6, padding: '10px 12px', borderRadius: 10,
                      background: 'rgba(148, 163, 184, 0.05)', border: '1px solid rgba(148, 163, 184, 0.1)',
                    }}
                  >
                    {message.details && message.details.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {message.details.map((d) => (
                          <div key={d.label} className="stat-tile" style={{ padding: '7px 9px' }}>
                            <div className="label-caps-sm" style={{ letterSpacing: 0, marginBottom: 2, fontSize: '9px' }}>{d.label}</div>
                            <div className="metric-value" style={{ fontSize: '13px' }}>{d.value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {message.matchedScenario && onTriggerScenario && (
                      <div style={{ marginTop: message.details?.length ? 10 : 0 }}>
                        <button
                          onClick={() => onTriggerScenario(message.matchedScenario!)}
                          disabled={triggerState !== 'idle'}
                          className="timeline-btn"
                          style={{
                            padding: '6px 12px', width: '100%', justifyContent: 'center',
                            borderColor: triggerState === 'done' ? 'rgba(52, 211, 153, 0.4)' : undefined,
                            color: triggerState === 'done' ? 'var(--accent-green)' : undefined,
                          }}
                        >
                          {triggerState === 'pending' && <FiLoader style={{ width: 11, height: 11, animation: 'spin 1s linear infinite' }} />}
                          {triggerState === 'done' && <FiCheckCircle style={{ width: 11, height: 11 }} />}
                          {triggerState === 'idle' && `Trigger "${message.matchedScenario}" simulation`}
                          {triggerState === 'pending' && 'Triggering…'}
                          {triggerState === 'done' && 'Triggered — check AI Decisions & Alerts'}
                        </button>
                        <p style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.4 }}>
                          This runs a real scenario on the backend simulator — not a preview or fabricated preview.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantMessage;
