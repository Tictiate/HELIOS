import React, { useEffect, useRef, useState } from 'react';
import { FiMessageSquare, FiRotateCcw, FiMaximize2 } from 'react-icons/fi';
import { useSimulation } from '../../context/SimulationContext';
import { buildReply } from '../../services/chatIntent';
import { injectScenario } from '../../services/api/scenarios';
import AssistantMessage, { type AssistantMessageData } from './AssistantMessage';
import ThinkingLoader from './ThinkingLoader';
import MessageInput from './MessageInput';
import SlideOver from '../common/SlideOver';

const VISIBLE_COUNT = 3;
const THINKING_DELAY_MS = 350;

function nowLabel(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * There is no real conversational backend behind this assistant (see `services/chatIntent.ts`
 * for the full explanation) — replies are built locally from real `SimulationContext` data via
 * an honest intent classifier, never fabricated. Casual/informational messages stay short with
 * no structured cards; network questions surface real telemetry; operational requests only offer
 * a trigger action when they match one of the backend's real simulated scenarios.
 */
const MessageStream: React.FC<{
  messages: AssistantMessageData[];
  thinking: boolean;
  triggering: Record<string, 'pending' | 'done'>;
  onTriggerScenario: (scenario: string, messageId: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}> = ({ messages, thinking, triggering, onTriggerScenario, scrollRef }) => (
  <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
    {messages.length === 0 && !thinking ? (
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
        Ask about network health, a specific tower, or describe an operational situation.
      </div>
    ) : (
      messages.map((m) => (
        <AssistantMessage
          key={m.id}
          message={m}
          triggerState={m.matchedScenario ? (triggering[m.id] ?? 'idle') : undefined}
          onTriggerScenario={m.matchedScenario ? (scenario) => onTriggerScenario(scenario, m.id) : undefined}
        />
      ))
    )}
    {thinking && <ThinkingLoader label="Thinking…" />}
  </div>
);

const HeliosAssistantPanel: React.FC = () => {
  const simulation = useSimulation();
  const [messages, setMessages] = useState<AssistantMessageData[]>([]);
  const [thinking, setThinking] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [triggering, setTriggering] = useState<Record<string, 'pending' | 'done'>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const expandedScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    if (expandedScrollRef.current) expandedScrollRef.current.scrollTop = expandedScrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const handleSend = (text: string) => {
    const userMsg: AssistantMessageData = { id: `user_${Date.now()}`, from: 'user', text, time: nowLabel() };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);

    window.setTimeout(() => {
      const reply = buildReply(text, simulation.state);
      const assistantMsg: AssistantMessageData = {
        id: `assistant_${Date.now()}`,
        from: 'assistant',
        text: reply.text,
        time: nowLabel(),
        details: reply.details,
        matchedScenario: reply.matchedScenario,
      };
      setMessages((prev) => [...prev, assistantMsg].slice(-50));
      setThinking(false);
    }, THINKING_DELAY_MS);
  };

  const handleTriggerScenario = async (scenario: string, messageId: string) => {
    setTriggering((prev) => ({ ...prev, [messageId]: 'pending' }));
    try {
      await injectScenario(scenario);
      setTriggering((prev) => ({ ...prev, [messageId]: 'done' }));
    } catch {
      // apiPost already surfaces a toast on failure — just reset so the user can retry.
      setTriggering((prev) => {
        const next = { ...prev };
        delete next[messageId];
        return next;
      });
    }
  };

  const handleClear = () => {
    setMessages([]);
    setTriggering({});
  };

  const visibleMessages = messages.slice(-VISIBLE_COUNT);

  return (
    <div className="glass-card-static h-full flex flex-col overflow-hidden">
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2.5">
          <FiMessageSquare className="icon icon-sm" style={{ color: 'var(--accent-cyan)' }} />
          <span className="label-caps">HELIOS Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > VISIBLE_COUNT && (
            <button onClick={() => setExpanded(true)} className="timeline-btn" style={{ padding: '3px 9px' }}>
              <FiMaximize2 style={{ width: 10, height: 10 }} /> Expand Chat
            </button>
          )}
          {messages.length > 0 && (
            <button onClick={handleClear} className="timeline-btn" style={{ padding: '3px 9px' }}>
              <FiRotateCcw style={{ width: 10, height: 10 }} /> New Chat
            </button>
          )}
        </div>
      </div>

      <MessageStream
        messages={visibleMessages}
        thinking={thinking}
        triggering={triggering}
        onTriggerScenario={handleTriggerScenario}
        scrollRef={scrollRef}
      />

      <div className="flex items-center" style={{ padding: '10px 12px', borderTop: '1px solid var(--glass-border)' }}>
        <MessageInput onSend={handleSend} disabled={thinking} />
      </div>

      <SlideOver open={expanded} onClose={() => setExpanded(false)} title="HELIOS Assistant — Full Conversation" width="440px">
        <div className="h-full flex flex-col" style={{ minHeight: 0 }}>
          <MessageStream
            messages={messages}
            thinking={thinking}
            triggering={triggering}
            onTriggerScenario={handleTriggerScenario}
            scrollRef={expandedScrollRef}
          />
          <div className="flex items-center" style={{ padding: '12px 16px', borderTop: '1px solid var(--glass-border)' }}>
            <MessageInput onSend={handleSend} disabled={thinking} />
          </div>
        </div>
      </SlideOver>
    </div>
  );
};

export default HeliosAssistantPanel;
