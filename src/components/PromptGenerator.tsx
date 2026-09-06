import { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  RefreshCw, 
  PenTool, 
  Filter, 
  Flame,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { JournalPrompt, MoodType } from '../types';
import { DEFAULT_PROMPTS, MOOD_CONFIGS } from '../utils/constants';

interface PromptGeneratorProps {
  onSelectPrompt: (prompt: JournalPrompt) => void;
  onGenerateAiPrompts: (mood: string, focus: string) => Promise<JournalPrompt[]>;
}

export function PromptGenerator({
  onSelectPrompt,
  onGenerateAiPrompts,
}: PromptGeneratorProps) {
  const [promptsList, setPromptsList] = useState<JournalPrompt[]>(DEFAULT_PROMPTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMood, setSelectedMood] = useState<string>('clarity');
  const [isLoading, setIsLoading] = useState(false);

  const categories = ['All', 'Clarity', 'Mindset', 'Brainstorming', 'Deep Work', 'Emotional Release', 'Vision'];

  const filteredPrompts = promptsList.filter(
    (p) => selectedCategory === 'All' || p.category === selectedCategory
  );

  const handleGenerateFresh = async () => {
    setIsLoading(true);
    try {
      const generated = await onGenerateAiPrompts(selectedMood, selectedCategory);
      if (generated && generated.length > 0) {
        setPromptsList((prev) => [...generated, ...prev]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="prompt-generator-container" className="max-w-4xl mx-auto space-y-8">
      {/* Top Generator Banner */}
      <div className="rounded-3xl border border-white/8 bg-[#080d17]/90 backdrop-blur-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight font-sans">
                Deep Cognitive Inquiries
              </h2>
              <p className="text-xs text-slate-400">
                Non-trivial prompts designed to bypass default mental scripts and surface leverage.
              </p>
            </div>
          </div>

          {/* AI Generator Control */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="bg-white/4 text-xs text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              {(Object.keys(MOOD_CONFIGS) as MoodType[]).map((m) => (
                <option key={m} value={m} className="bg-[#080d17] text-white">
                  State: {MOOD_CONFIGS[m].label}
                </option>
              ))}
            </select>

            <button
              type="button"
              id="btn-generate-ai-prompts"
              onClick={handleGenerateFresh}
              disabled={isLoading}
              className="paradigm-glint-btn px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2 cursor-pointer disabled:opacity-40 shrink-0 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              )}
              <span>{isLoading ? 'Synthesizing...' : 'Generate New Inquiries'}</span>
            </button>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 shrink-0 cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 font-semibold shadow-[0_0_10px_rgba(0,229,255,0.15)]'
                  : 'bg-white/4 text-slate-400 border-white/8 hover:bg-white/8 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrompts.map((prompt, idx) => (
          <div
            key={prompt.id || idx}
            className="p-5 rounded-2xl bg-[#080d17]/85 border border-white/8 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 backdrop-blur-xl group shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono uppercase tracking-wider font-semibold">
                  {prompt.category}
                </span>
                <span className="text-[11px] font-mono text-slate-500">#{idx + 1}</span>
              </div>

              <h4 className="text-sm sm:text-base font-semibold text-white group-hover:text-cyan-300 transition-colors leading-snug mb-2 font-sans">
                {prompt.text}
              </h4>

              <p className="text-xs text-slate-400 leading-relaxed italic">
                {prompt.subtext}
              </p>
            </div>

            <div className="pt-3 border-t border-white/8 flex items-center justify-end">
              <button
                type="button"
                onClick={() => onSelectPrompt(prompt)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.1)]"
              >
                <PenTool className="w-3 h-3" />
                <span>Journal on this &rarr;</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
