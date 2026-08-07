import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiAlertCircle, FiInfo, FiCheckCircle, FiX } from 'react-icons/fi';

type ToastVariant = 'error' | 'info' | 'success';

interface ToastMessage {
  id: string;
  text: string;
  variant: ToastVariant;
}

/**
 * Minimal pub/sub notification bus (not a state management library) so any module — mainly
 * services/api/client.ts on REST failures — can raise a toast without importing React state.
 */
let toasts: ToastMessage[] = [];
let listeners: Array<(items: ToastMessage[]) => void> = [];

function emit(): void {
  listeners.forEach((listener) => listener(toasts));
}

export function showToast(text: string, variant: ToastVariant = 'error'): void {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  toasts = [...toasts, { id, text, variant }];
  emit();
  setTimeout(() => dismissToast(id), 5000);
}

function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

const VARIANT_META: Record<ToastVariant, { color: string; icon: typeof FiAlertCircle }> = {
  error: { color: '#f87171', icon: FiAlertCircle },
  info: { color: '#3b82f6', icon: FiInfo },
  success: { color: '#34d399', icon: FiCheckCircle },
};

export const ToastContainer: React.FC = () => {
  const [items, setItems] = useState<ToastMessage[]>(toasts);

  useEffect(() => {
    listeners.push(setItems);
    return () => { listeners = listeners.filter((l) => l !== setItems); };
  }, []);

  return (
    <div className="toast-stack">
      <AnimatePresence>
        {items.map((toast) => {
          const meta = VARIANT_META[toast.variant];
          const Icon = meta.icon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="toast-item"
              style={{ borderLeftColor: meta.color }}
            >
              <Icon style={{ width: 15, height: 15, color: meta.color, flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{toast.text}</span>
              <button className="toast-dismiss" onClick={() => dismissToast(toast.id)}>
                <FiX style={{ width: 12, height: 12 }} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
