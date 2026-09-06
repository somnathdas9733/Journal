import { useState } from 'react';
import { MessageSquare, Sparkles, X, Volume2, Send, CornerDownLeft, Maximize2 } from 'lucide-react';

interface FloatingAIWidgetProps {
  onOpenFullChat: () => void;
  recentContext?: string;
  onSavedAsEntry?: (title: string, content: string) => void;
}

export function FloatingAIWidget({ onOpenFullChat, recentContext, onSavedAsEntry }: FloatingAIWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickDialogue, setQuickDialogue] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Good day. I am your Paradigm reflection partner. What decision or thought is occupying your focus right now?',
    },
  ]);

  if (isDismissed) return null;

  const handleQuickSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setQuickDialogue((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: quickDialogue.map((d) => ({ role: d.role, content: d.text })),
          context: recentContext || '',
          persona: 'reflective',
        }),
      });

      if (!res.ok) {
        let errMessage = 'Failed to generate response';
        try {
          const errData = await res.json();
          errMessage = errData.error || errMessage;
        } catch {
          const text = await res.text();
          if (text) errMessage = text;
        }
        throw new Error(errMessage);
      }

      const data = await res.json();
      setQuickDialogue((prev) => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err: any) {
      setQuickDialogue((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Reflection paused: ${err?.message || 'Could not connect to AI service.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="floating-ai-widget-container" className="fixed bottom-6 right-6 z-40 select-none">
      {/* Expanded Mini Chat Popover */}
      {isOpen ? (
        <div className="w-[340px] sm:w-[380px] h-[480px] rounded-3xl border border-white/10 bg-[#080d17]/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between bg-white/4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-500/40 p-0.5 bg-cyan-950/40">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#080d17]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <span>Paradigm Companion</span>
                  <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400">Socratic Reflection Stream</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullChat();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Expand to Fullscreen Companion"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#05080e]/60">
            {quickDialogue.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                      : 'bg-white/5 border border-white/8 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 p-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.3s]" />
                <span className="text-[11px] text-slate-400 ml-1">Reflecting...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-white/8 bg-[#080d17]">
            <div className="flex items-center gap-2 bg-white/4 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-cyan-500/50 focus-within:bg-white/6 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleQuickSend();
                  }
                }}
                placeholder="Ask or reflect on an idea..."
                className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none py-1"
              />
              <button
                type="button"
                onClick={handleQuickSend}
                disabled={!input.trim() || isLoading}
                className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-30 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                <CornerDownLeft className="w-2.5 h-2.5" /> Enter to send
              </span>
              <button
                type="button"
                onClick={onOpenFullChat}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Full studio &rarr;
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Circular Avatar Companion (Identical to Screenshot Bottom-Right) */
        <div className="relative group">
          {/* Dismiss button 'x' on top right corner of avatar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            title="Dismiss"
            className="absolute -top-1 -right-1 z-20 w-4 h-4 rounded-full bg-slate-900 border border-white/20 text-slate-300 hover:text-white flex items-center justify-center text-[10px] shadow-md opacity-75 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X className="w-2.5 h-2.5" />
          </button>

          <button
            type="button"
            id="btn-floating-companion"
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 bg-[#0b121e] border-2 border-white/20 hover:border-cyan-400 shadow-[0_0_25px_rgba(0,0,0,0.8)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center hover:scale-105"
          >
            {/* Friendly Avatar Portrait Silhouette */}
            <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-700 to-slate-900 flex flex-col items-center justify-end overflow-hidden">
              {/* Head */}
              <div className="w-5 h-5 rounded-full bg-slate-300 mb-0.5" />
              {/* Torso in blue shirt like screenshot */}
              <div className="w-9 h-6 rounded-t-full bg-sky-600/90 border-t border-sky-400/50 flex items-center justify-center" />
            </div>

            {/* Speaker Sound Icon in Bottom of Circle */}
            <div className="absolute bottom-1 w-5 h-5 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white/90">
              <Volume2 className="w-3 h-3 text-cyan-300" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
