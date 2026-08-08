import React, { useEffect, useRef, useState } from 'react';
import { FiSend, FiMessageSquare, FiMaximize2 } from 'react-icons/fi';
import { useSimulation } from '../../context/SimulationContext';
import SlideOver from '../common/SlideOver';

interface ChatMessage {
  id: string;
  from: 'assistant';
  text: string;
  time: string;
}

const VISIBLE_COUNT = 3;

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const ChatBubble: React.FC<{ m: ChatMessage }> = ({ m }) => (
  <div className="flex justify-start">
    <div className="chat-avatar" style={{ marginRight: 8 }}>H</div>
    <div className="chat-bubble assistant">
      <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.5 }}>{m.text}</p>
      <span style={{ fontSize: '9px', opacity: 0.6, display: 'block', marginTop: 3 }}>{m.time}</span>
    </div>
  </div>
);

const ChatInput: React.FC<{ draft: string; setDraft: (v: string) => void }> = ({ draft, setDraft }) => (
  <div className="flex items-center gap-2" style={{ padding: '10px 12px', borderTop: '1px solid var(--glass-border)' }}>
    <input
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      placeholder="Type your message..."
      className="chat-input"
    />
    <button className="chat-send-btn" title="Send (chat API not yet connected)">
      <FiSend style={{ width: 13, height: 13 }} />
    </button>
  </div>
);

/**
 * Layout-only chat surface fed by the real `helios_insight` field from the backend's
 * explainability output — there is no chat API yet, so the input/send stay inert, exactly as
 * instructed ("using helios_insight until the chat API exists"). The compact inline view shows
 * only the latest few messages; "Expand Chat" opens the full conversation in a slide-over — both
 * read the same `messages` state, so the backend wiring (the effect below) is untouched.
 */
const HeliosAssistantPanel: React.FC = () => {
  const { assistantInsight } = useSimulation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [expanded, setExpanded] = useState(false);
  const lastTextRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!assistantInsight || assistantInsight.text === lastTextRef.current) return;
    lastTextRef.current = assistantInsight.text;
    setMessages((prev) => [
      ...prev,
      { id: `${assistantInsight.timestamp}-${prev.length}`, from: 'assistant' as const, text: assistantInsight.text, time: formatTime(assistantInsight.timestamp) },
    ].slice(-50));
  }, [assistantInsight]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

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
          <button
            onClick={() => { setMessages([]); lastTextRef.current = null; }}
            className="timeline-btn"
            style={{ padding: '3px 9px' }}
          >
            New Chat
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visibleMessages.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
            Waiting for the AI engine's first insight…
          </div>
        ) : (
          visibleMessages.map((m) => <ChatBubble key={m.id} m={m} />)
        )}
      </div>

      <ChatInput draft={draft} setDraft={setDraft} />

      <SlideOver open={expanded} onClose={() => setExpanded(false)} title="HELIOS Assistant — Full Conversation" width="420px">
        <div className="flex-1 overflow-y-auto" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m) => <ChatBubble key={m.id} m={m} />)}
        </div>
      </SlideOver>
    </div>
  );
};

export default HeliosAssistantPanel;
