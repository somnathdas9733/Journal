import { useState } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  Plus, 
  Layers, 
  BookmarkPlus, 
  ArrowRight, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Loader2,
  Shuffle
} from 'lucide-react';
import { BrainstormBoard, BrainstormIdea } from '../types';
import { BRAINSTORM_FRAMEWORKS } from '../utils/constants';

interface BrainstormCanvasProps {
  boards: BrainstormBoard[];
  onGenerateBoard: (topic: string, framework: string) => Promise<BrainstormBoard | null>;
  onSaveToJournal: (title: string, content: string) => void;
  onDeleteBoard: (id: string) => void;
}

export function BrainstormCanvas({
  boards,
  onGenerateBoard,
  onSaveToJournal,
  onDeleteBoard,
}: BrainstormCanvasProps) {
  const [topic, setTopic] = useState('');
  const [framework, setFramework] = useState('first-principles');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeBoard, setActiveBoard] = useState<BrainstormBoard | null>(boards[0] || null);

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const created = await onGenerateBoard(topic.trim(), framework);
      if (created) {
        setActiveBoard(created);
        setTopic('');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConvertIdeaToEntry = (idea: BrainstormIdea, boardTopic: string) => {
    const entryTitle = `Brainstorm: ${idea.title}`;
    const entryContent = `### Topic: ${boardTopic}
**Category**: ${idea.category || 'Strategic Concept'}

${idea.description}

#### Actionable Test / Next Step:
- [ ] ${idea.actionableStep || 'Define concrete hypothesis.'}

---
*Generated via Paradigm Brainstorm Engine*`;

    onSaveToJournal(entryTitle, entryContent);
  };

  const handleConvertWholeBoard = (board: BrainstormBoard) => {
    const entryTitle = `Brainstorm Matrix: ${board.topic}`;
    const ideasContent = board.ideas
      .map(
        (idea, idx) =>
          `### ${idx + 1}. ${idea.title} [${idea.category || 'Idea'}]\n${idea.description}\n**Action**: ${idea.actionableStep || 'N/A'}`
      )
      .join('\n\n');

    const fullContent = `## Brainstorm Summary
${board.summary || `Exploration of ${board.topic} using ${board.framework} framework.`}

${ideasContent}

---
*Created on ${new Date(board.createdAt).toLocaleDateString()}*`;

    onSaveToJournal(entryTitle, fullContent);
  };

  return (
    <div id="brainstorm-canvas-container" className="max-w-5xl mx-auto space-y-8">
      {/* Creation Studio Card */}
      <div className="rounded-3xl border border-white/8 bg-[#080d17]/90 backdrop-blur-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight font-sans">
              Cognitive Brainstorming Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Transform ambiguous challenges into structured, multi-dimensional idea maps.
            </p>
          </div>
        </div>

        {/* Input Topic */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Challenge or Topic to Deconstruct
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              id="input-brainstorm-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="e.g. Redesigning our engineering syncs to be 10x more asynchronous..."
              className="flex-1 bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/6 transition-colors"
            />

            <button
              type="button"
              id="btn-generate-brainstorm"
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="paradigm-glint-btn px-6 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center gap-2 cursor-pointer disabled:opacity-40 shrink-0"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
              ) : (
                <Sparkles className="w-4 h-4 text-cyan-300" />
              )}
              <span>{isGenerating ? 'Deconstructing...' : 'Generate Matrix'}</span>
            </button>
          </div>
        </div>

        {/* Framework Selector */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Select Thinking Model
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {BRAINSTORM_FRAMEWORKS.map((fw) => {
              const isSelected = framework === fw.id;
              return (
                <div
                  key={fw.id}
                  onClick={() => setFramework(fw.id)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.1)] text-white'
                      : 'bg-white/4 border-white/8 hover:bg-white/7 hover:border-white/15 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{fw.name}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {fw.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Boards Switcher Bar */}
      {boards.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs text-slate-400 font-semibold px-2 shrink-0 font-mono">
            Saved Sessions:
          </span>
          {boards.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveBoard(b)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${
                activeBoard?.id === b.id
                  ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                  : 'bg-white/4 text-slate-400 border-white/8 hover:text-white hover:bg-white/8'
              }`}
            >
              <span className="truncate max-w-[140px]">{b.topic}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {b.ideas.length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Active Brainstorm Board Content */}
      {activeBoard ? (
        <div className="space-y-5">
          {/* Active Board Header */}
          <div className="p-5 rounded-3xl bg-[#080d17]/85 border border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono uppercase tracking-wider mb-1">
                <span>{activeBoard.framework}</span>
                <span>•</span>
                <span>{new Date(activeBoard.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight font-sans">
                {activeBoard.topic}
              </h3>
              {activeBoard.summary && (
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {activeBoard.summary}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleConvertWholeBoard(activeBoard)}
                className="paradigm-glint-btn px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-cyan-300" />
                <span>Save All to Journal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete brainstorm "${activeBoard.topic}"?`)) {
                    onDeleteBoard(activeBoard.id);
                    setActiveBoard(boards.find((b) => b.id !== activeBoard.id) || null);
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer border border-white/6"
                title="Delete Board"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Generated Ideas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBoard.ideas.map((idea, idx) => (
              <div
                key={idea.id || idx}
                className="p-5 rounded-2xl bg-[#090e18]/85 border border-white/8 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono uppercase font-semibold">
                      {idea.category || `Concept #${idx + 1}`}
                    </span>
                    <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-2 font-sans">{idea.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{idea.description}</p>
                </div>

                <div className="pt-3 border-t border-white/6 flex flex-col gap-2.5">
                  {idea.actionableStep && (
                    <div className="text-xs text-emerald-200 bg-emerald-950/30 border border-emerald-500/25 p-2.5 rounded-xl">
                      <strong className="text-emerald-400 block text-[11px] mb-0.5 font-mono">
                        Testable Next Step:
                      </strong>
                      {idea.actionableStep}
                    </div>
                  )}

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleConvertIdeaToEntry(idea, activeBoard.topic)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Write Entry on this Concept &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl border border-white/8 bg-[#080d17]/80 space-y-3">
          <Lightbulb className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No active brainstorm matrix</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Input any business dilemma, architectural problem, or personal inflection point above to generate an actionable ideas matrix.
          </p>
        </div>
      )}
    </div>
  );
}
