import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  BookmarkPlus, 
  RotateCcw, 
  HelpCircle,
  Compass,
  Layers,
  ArrowRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, JournalEntry } from '../types';

interface AIChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, persona: string, context?: string) => Promise<void>;
  onSaveAsEntry: (title: string, content: string) => void;
  onClearHistory: () => void;
  recentEntries: JournalEntry[];
  activeEntryContext?: JournalEntry | null;
  onClearContext?: () => void;
}

export function AIChatView({
  messages,
  onSendMessage,
  onSaveAsEntry,
  onClearHistory,
  recentEntries,
  activeEntryContext,
  onClearContext,
}: AIChatViewProps) {
  const [input, setInput] = useState('');
  const [persona, setPersona] = useState<'reflective' | 'brainstormer' | 'stoic' | 'clarity'>('reflective');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const text = input.trim();
    setInput('');
    setIsSending(true);

    try {
      // Build context string from activeEntryContext or recent entries
      let contextText = '';
      if (activeEntryContext) {
        contextText = `Focus Entry: "${activeEntryContext.title}"\n${activeEntryContext.content}`;
      } else if (recentEntries.length > 0) {
        contextText = recentEntries
          .slice(0, 3)
          .map((e) => `[Entry: ${e.title} (${e.mood})]: ${e.content.slice(0, 400)}`)
          .join('\n\n');
      }

      await onSendMessage(text, persona, contextText);
    } finally {
      setIsSending(false);
    }
  };

  const handleStarterClick = (promptText: string) => {
    setInput(promptText);
  };

  return (
    <div id="ai-chat-studio-container" className="max-w-4xl mx-auto flex flex-col h-[740px] rounded-3xl border border-white/8 bg-[#080d17]/90 backdrop-blur-2xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-white/8 bg-white/4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-white font-sans">
                Socratic Reflection Studio
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono font-medium">
                Gemini Multi-Model Ladder
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dialogue designed to uncover blind spots, test premises, and catalyze action.
            </p>
          </div>
        </div>

        {/* Persona Selector & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/4 border border-white/8 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setPersona('reflective')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                persona === 'reflective' ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.15)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Reflective
            </button>
            <button
              type="button"
              onClick={() => setPersona('brainstormer')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                persona === 'brainstormer' ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.15)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Strategist
            </button>
            <button
              type="button"
              onClick={() => setPersona('stoic')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                persona === 'stoic' ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.15)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Stoic
            </button>
            <button
              type="button"
              onClick={() => setPersona('clarity')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                persona === 'clarity' ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.15)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Clarity
            </button>
          </div>

          <button
            type="button"
            onClick={onClearHistory}
            title="Clear Chat History"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-colors cursor-pointer border border-white/6"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Context Banner (if focused on a specific entry) */}
      {activeEntryContext && (
        <div className="px-5 py-2.5 bg-cyan-950/30 border-b border-cyan-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-200 truncate font-mono">
            <span className="font-semibold text-cyan-400">Context Active:</span>
            <span className="text-slate-200 truncate">&ldquo;{activeEntryContext.title}&rdquo;</span>
          </div>
          {onClearContext && (
            <button
              type="button"
              onClick={onClearContext}
              className="text-cyan-400 hover:text-cyan-200 text-[11px] underline ml-2 shrink-0 cursor-pointer"
            >
              Detach
            </button>
          )}
        </div>
      )}

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#05080e]/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5 py-10">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.15)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1.5 font-sans">
                How can we explore your thinking today?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose a reflection prompt below or ask anything regarding decisions, emotional friction, or long-term vision.
              </p>
            </div>

            {/* Quick Starters */}
            <div className="grid grid-cols-1 gap-2.5 w-full text-left">
              <button
                type="button"
                onClick={() => handleStarterClick('What is the single most important friction point in my current work?')}
                className="p-3.5 rounded-2xl bg-white/4 hover:bg-white/8 border border-white/8 hover:border-cyan-500/30 transition-all text-xs text-slate-300 hover:text-white flex items-center justify-between cursor-pointer group"
              >
                <span>&ldquo;What is the single most important friction point in my work?&rdquo;</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => handleStarterClick('Help me challenge my primary assumption for this upcoming week.')}
                className="p-3.5 rounded-2xl bg-white/4 hover:bg-white/8 border border-white/8 hover:border-cyan-500/30 transition-all text-xs text-slate-300 hover:text-white flex items-center justify-between cursor-pointer group"
              >
                <span>&ldquo;Help me challenge my primary assumption for this upcoming week.&rdquo;</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => handleStarterClick('Synthesize my recent reflections into 3 actionable operating principles.')}
                className="p-3.5 rounded-2xl bg-white/4 hover:bg-white/8 border border-white/8 hover:border-cyan-500/30 transition-all text-xs text-slate-300 hover:text-white flex items-center justify-between cursor-pointer group"
              >
                <span>&ldquo;Synthesize my recent reflections into 3 operating principles.&rdquo;</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 mt-1 shadow-[0_0_10px_rgba(0,229,255,0.15)]">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                    : 'bg-white/5 border border-white/8 text-slate-200 rounded-bl-none shadow-md'
                }`}
              >
                <div className={`markdown-body max-w-none text-xs sm:text-sm ${msg.role === 'user' ? 'text-white' : 'text-slate-200'}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {msg.role !== 'user' && (
                  <div className="mt-3 pt-2.5 border-t border-white/8 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSaveAsEntry('Insight from Socratic Session', msg.content)}
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Save as Reflection</span>
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 text-slate-300 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isSending && (
          <div className="flex items-center gap-3 text-cyan-400 p-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Consulting Socratic reflection model...
            </span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/8 bg-[#080d17]">
        <div className="flex items-center gap-2.5 bg-white/4 border border-white/10 rounded-2xl p-2 focus-within:border-cyan-500/50 focus-within:bg-white/6 transition-colors">
          <textarea
            id="chat-user-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your reflection or inquiry... (Shift+Enter for new line)"
            rows={2}
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none resize-none px-2 py-1 leading-relaxed"
          />

          <button
            type="button"
            id="chat-btn-send"
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="p-3 rounded-xl text-slate-950 font-bold bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.3)] flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
