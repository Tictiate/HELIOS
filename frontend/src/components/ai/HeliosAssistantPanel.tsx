import React, { useState } from 'react';
import { FiSend, FiMessageSquare } from 'react-icons/fi';

interface ChatMessage {
  id: string;
  from: 'assistant' | 'user';
  text: string;
  time: string;
}

const SEED_MESSAGES: ChatMessage[] = [
  { id: 'm1', from: 'assistant', text: 'Monitoring network conditions across all towers and edge nodes.', time: '09:14' },
  { id: 'm2', from: 'user', text: 'Any issues I should know about?', time: '09:14' },
  { id: 'm3', from: 'assistant', text: 'All systems nominal right now. I’ll flag anything that needs attention as soon as it comes up.', time: '09:15' },
];

/**
 * Layout-only placeholder for the future HELIOS Assistant — no chat logic yet. Mock seed
 * conversation, a working (but inert) input, and a "New Chat" reset, ready for backend wiring.
 */
const HeliosAssistantPanel: React.FC = () => {
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [draft, setDraft] = useState('');

  return (
    <div className="glass-card-static h-full flex flex-col overflow-hidden">
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2.5">
          <FiMessageSquare className="icon icon-sm" style={{ color: 'var(--accent-cyan)' }} />
          <span className="label-caps">HELIOS Assistant</span>
        </div>
        <button
          onClick={() => setMessages(SEED_MESSAGES)}
          className="timeline-btn"
          style={{ padding: '3px 9px' }}
        >
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.from === 'assistant' && (
              <div className="chat-avatar" style={{ marginRight: 8 }}>H</div>
            )}
            <div className={`chat-bubble ${m.from}`}>
              <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.5 }}>{m.text}</p>
              <span style={{ fontSize: '9px', opacity: 0.6, display: 'block', marginTop: 3 }}>{m.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2" style={{ padding: '10px 12px', borderTop: '1px solid var(--glass-border)' }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button className="chat-send-btn" title="Send (not yet connected)">
          <FiSend style={{ width: 13, height: 13 }} />
        </button>
      </div>
    </div>
  );
};

export default HeliosAssistantPanel;
