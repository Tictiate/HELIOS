import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled = false }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about network health, a tower, or describe a situation..."
        disabled={disabled}
        className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
      />
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 p-2.5 rounded-xl font-bold transition-all shadow-md shadow-cyan-950/40 shrink-0 flex items-center justify-center"
        title="Send Intent to HELIOS AI"
      >
        <FiSend className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};

export default MessageInput;
