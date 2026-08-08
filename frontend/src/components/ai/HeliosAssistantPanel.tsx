import React, { useState, useRef, useEffect } from 'react';
import { FiCpu, FiRotateCcw, FiUser } from 'react-icons/fi';
import { fetchIntent, fetchAnalysis } from '../../services/chatApi';
import IntentCard, { type IntentData } from './IntentCard';
import ProblemCard, { type ProblemData } from './ProblemCard';
import StrategyCard, { type StrategyData } from './StrategyCard';
import ReasoningCard from './ReasoningCard';
import ResultsCard, { type ResultsData } from './ResultsCard';
import ThinkingLoader from './ThinkingLoader';
import MessageInput from './MessageInput';

type StreamItem =
  | { id: string; type: 'user'; text: string; timestamp: string }
  | { id: string; type: 'intent'; data: IntentData }
  | { id: string; type: 'problem'; data: ProblemData }
  | { id: string; type: 'strategy'; data: StrategyData }
  | { id: string; type: 'reasoning'; data: string }
  | { id: string; type: 'results'; data: ResultsData };

export const HeliosAssistantPanel: React.FC = () => {
  const [stream, setStream] = useState<StreamItem[]>([]);
  const [loadingStep, setLoadingStep] = useState<'intent' | 'analyzing' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new cards appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [stream, loadingStep]);

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || loadingStep !== null) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `user_${Date.now()}`;

    // Add user prompt to stream
    setStream((prev) => [
      ...prev,
      { id: userMsgId, type: 'user', text: promptText, timestamp: time },
    ]);

    // Step 1: Thinking for Intent
    setLoadingStep('intent');

    try {
      // Responsibility 1: Understand Operator Intent
      const intentData = await fetchIntent(promptText);

      setStream((prev) => [
        ...prev,
        { id: `intent_${Date.now()}`, type: 'intent', data: intentData },
      ]);

      // Step 2: Analyzing AI Decision
      setLoadingStep('analyzing');

      // Responsibility 2: Explain AI Decisions
      const analysisData = await fetchAnalysis(intentData);

      // Sequential streaming of analysis cards
      await new Promise((res) => setTimeout(res, 400));
      setStream((prev) => [
        ...prev,
        { id: `prob_${Date.now()}`, type: 'problem', data: analysisData.problem },
      ]);

      await new Promise((res) => setTimeout(res, 400));
      setStream((prev) => [
        ...prev,
        { id: `strat_${Date.now()}`, type: 'strategy', data: analysisData.strategy },
      ]);

      await new Promise((res) => setTimeout(res, 400));
      setStream((prev) => [
        ...prev,
        { id: `reas_${Date.now()}`, type: 'reasoning', data: analysisData.reasoning },
      ]);

      await new Promise((res) => setTimeout(res, 400));
      setStream((prev) => [
        ...prev,
        { id: `res_${Date.now()}`, type: 'results', data: analysisData.results },
      ]);

    } catch (err) {
      console.error('Streaming sequence error:', err);
    } finally {
      setLoadingStep(null);
    }
  };

  const handleClear = () => {
    setStream([]);
    setLoadingStep(null);
  };

  return (
    <div className="glass-card-static h-full flex flex-col overflow-hidden relative border border-slate-800/80 shadow-2xl rounded-2xl">
      {/* Header */}
      <div className="panel-header justify-between shrink-0 px-4 py-3 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-inner">
            <FiCpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="label-caps font-bold text-slate-100 text-xs tracking-wider">HELIOS Assistant</h3>
            <p className="text-[9px] text-slate-400 font-medium">Autonomous Operations & XAI Engine</p>
          </div>
        </div>
        {stream.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-[10px] text-slate-300 font-semibold transition-all shadow-sm"
            title="Clear Chat Stream"
          >
            <FiRotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Stream List / Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 custom-scrollbar"
      >
        {stream.length === 0 && loadingStep === null ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 shadow-inner">
              <FiCpu className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-300 tracking-wide mb-1">HELIOS Network Operations Assistant</h4>
            <p className="text-[11px] text-slate-400 max-w-[260px] leading-relaxed">
              Describe intent or incident (e.g. stadium event, emergency relief, cyber threat) to initiate XAI analysis.
            </p>
          </div>
        ) : (
          <>
            {stream.map((item) => {
              if (item.type === 'user') {
                return (
                  <div key={item.id} className="flex justify-end my-1">
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-950 px-3.5 py-2.5 rounded-2xl rounded-tr-xs text-xs font-semibold max-w-[85%] shadow-md flex items-start gap-2">
                      <FiUser className="w-3.5 h-3.5 text-slate-950 mt-0.5 shrink-0" />
                      <div>
                        <p className="leading-snug">{item.text}</p>
                        <span className="text-[9px] text-slate-900/75 block text-right mt-1 font-medium">{item.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              if (item.type === 'intent') return <IntentCard key={item.id} intent={item.data} />;
              if (item.type === 'problem') return <ProblemCard key={item.id} problem={item.data} />;
              if (item.type === 'strategy') return <StrategyCard key={item.id} strategy={item.data} />;
              if (item.type === 'reasoning') return <ReasoningCard key={item.id} reasoning={item.data} />;
              if (item.type === 'results') return <ResultsCard key={item.id} results={item.data} />;
              return null;
            })}

            {/* Neural Loader */}
            {loadingStep === 'intent' && <ThinkingLoader label="Thinking..." />}
            {loadingStep === 'analyzing' && <ThinkingLoader label="Analyzing AI Decision..." />}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md shrink-0">
        <MessageInput onSend={handleSendPrompt} disabled={loadingStep !== null} />
      </div>
    </div>
  );
};

export default HeliosAssistantPanel;
