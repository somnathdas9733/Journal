import { useState, useEffect } from 'react';
import { 
  Save, 
  Sparkles, 
  Eye, 
  Edit3, 
  Tag as TagIcon, 
  BrainCircuit, 
  HelpCircle, 
  Check, 
  ArrowLeft,
  X,
  Compass,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { JournalEntry, MoodType } from '../types';
import { MOOD_CONFIGS, DEFAULT_PROMPTS } from '../utils/constants';

interface JournalEditorProps {
  initialEntry?: JournalEntry | null;
  onSave: (entry: JournalEntry) => void;
  onCancel: () => void;
  onAnalyzeAi?: (title: string, content: string) => Promise<any>;
  onExpandThought?: (rawText: string) => Promise<string>;
}

export function JournalEditor({
  initialEntry,
  onSave,
  onCancel,
  onAnalyzeAi,
  onExpandThought,
}: JournalEditorProps) {
  const [title, setTitle] = useState(initialEntry?.title || '');
  const [content, setContent] = useState(initialEntry?.content || '');
  const [mood, setMood] = useState<MoodType>(initialEntry?.mood || 'deep-focus');
  const [tags, setTags] = useState<string[]>(initialEntry?.tags || ['Focus', 'Reflection']);
  const [tagInput, setTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(initialEntry?.aiInsights || undefined);
  const [showPromptPicker, setShowPromptPicker] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync when initialEntry changes
  useEffect(() => {
    if (initialEntry) {
      setTitle(initialEntry.title);
      setContent(initialEntry.content);
      setMood(initialEntry.mood);
      setTags(initialEntry.tags);
      setAiInsights(initialEntry.aiInsights);
    }
  }, [initialEntry]);

  // Word count and reading time
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    setIsSaving(true);
    const entryToSave: JournalEntry = {
      id: initialEntry?.id || `entry-${Date.now()}`,
      title: title.trim() || 'Untitled Reflection',
      content: content.trim(),
      mood,
      tags: tags.length > 0 ? tags : ['General'],
      createdAt: initialEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiInsights,
    };

    try {
      onSave(entryToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiExpand = async () => {
    if (!content.trim() || !onExpandThought || isExpanding) return;
    setIsExpanding(true);
    try {
      const expanded = await onExpandThought(content);
      if (expanded) {
        setContent(expanded);
      }
    } catch (err) {
      console.error('Failed to expand:', err);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleAiAnalyze = async () => {
    if (!content.trim() || !onAnalyzeAi || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const analysis = await onAnalyzeAi(title, content);
      if (analysis) {
        setAiInsights(analysis);
        if (analysis.keywords && Array.isArray(analysis.keywords)) {
          const mergedTags = Array.from(new Set([...tags, ...analysis.keywords]));
          setTags(mergedTags.slice(0, 6));
        }
      }
    } catch (err) {
      console.error('Failed to analyze:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="journal-editor-container" className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reflections</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/4 hover:bg-white/8 text-slate-300 border border-white/8 transition-colors cursor-pointer"
          >
            {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPreview ? 'Edit' : 'Preview'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || (!title.trim() && !content.trim())}
            className="paradigm-glint-btn px-5 py-2 rounded-xl text-xs font-semibold text-white transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-40"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-cyan-300" />
            ) : (
              <Save className="w-4 h-4 text-cyan-300" />
            )}
            <span>{saveSuccess ? 'Saved' : 'Save Reflection'}</span>
          </button>
        </div>
      </div>

      {/* Main Glass Workspace */}
      <div className="rounded-3xl border border-white/8 bg-[#080d17]/90 backdrop-blur-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Title Input */}
        <div>
          <input
            type="text"
            id="editor-entry-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this reflection a title..."
            className="w-full bg-transparent text-2xl sm:text-3xl font-bold tracking-tight text-white placeholder:text-slate-600 focus:outline-none border-b border-white/8 pb-3 font-sans"
          />
        </div>

        {/* Mood Selector Chips */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 font-mono">
            Cognitive State / Focus
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(MOOD_CONFIGS) as MoodType[]).map((mKey) => {
              const cfg = MOOD_CONFIGS[mKey];
              const isSelected = mood === mKey;
              return (
                <button
                  key={mKey}
                  type="button"
                  onClick={() => setMood(mKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? `${cfg.badgeClass} ring-1 ring-cyan-400/50 shadow-[0_0_10px_rgba(0,229,255,0.15)] font-semibold`
                      : 'border-white/8 bg-white/4 text-slate-400 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shadow-[0_0_6px_currentColor]"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Assisted Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-white/4 border border-white/8">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="editor-btn-expand-ai"
              onClick={handleAiExpand}
              disabled={isExpanding || !content.trim()}
              title="Transform brief notes into an articulate structured entry"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-950/40 text-cyan-300 hover:bg-cyan-950/60 border border-cyan-500/30 transition-colors disabled:opacity-40 cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.1)]"
            >
              {isExpanding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>Expand with AI</span>
            </button>

            <button
              type="button"
              id="editor-btn-analyze-ai"
              onClick={handleAiAnalyze}
              disabled={isAnalyzing || !content.trim()}
              title="Extract psychological insight, deep questions, and action items"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-950/40 text-blue-300 hover:bg-blue-950/60 border border-blue-500/30 transition-colors disabled:opacity-40 cursor-pointer shadow-[0_0_10px_rgba(59,130,246,0.1)]"
            >
              {isAnalyzing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              ) : (
                <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span>Analyze Reflection</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPromptPicker(!showPromptPicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/4 hover:bg-white/8 text-slate-300 border border-white/8 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Prompts</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>{words} words</span>
            <span>~{readingTime} min read</span>
          </div>
        </div>

        {/* Prompt Inserter Dropdown Drawer */}
        {showPromptPicker && (
          <div className="p-4 rounded-2xl bg-[#090e18] border border-cyan-500/30 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-300 font-mono">
              <span>Select an inquiry prompt to insert into your reflection:</span>
              <button
                type="button"
                onClick={() => setShowPromptPicker(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
              {DEFAULT_PROMPTS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    const addition = `\n\n### Inquiry: ${p.text}\n*${p.subtext}*\n\n`;
                    setContent((prev) => prev + addition);
                    setShowPromptPicker(false);
                  }}
                  className="p-3 rounded-xl bg-white/4 hover:bg-cyan-950/30 border border-white/8 hover:border-cyan-500/30 transition-all cursor-pointer text-left"
                >
                  <span className="text-[10px] text-cyan-400 font-mono block mb-1 uppercase tracking-wider font-semibold">
                    {p.category}
                  </span>
                  <p className="text-xs text-slate-200 font-medium line-clamp-2">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor or Markdown Preview */}
        {isPreview ? (
          <div className="min-h-[360px] p-6 rounded-2xl bg-white/4 border border-white/8 text-slate-200 leading-relaxed space-y-4">
            {content.trim() ? (
              <div className="markdown-body prose prose-invert max-w-none text-slate-200">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-slate-500 italic">No content to preview yet.</p>
            )}
          </div>
        ) : (
          <textarea
            id="editor-entry-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write freely. Brainstorm a strategic decision, capture unvarnished thoughts, or unpack a friction point..."
            rows={14}
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-none resize-y leading-relaxed text-sm sm:text-base font-sans"
          />
        )}

        {/* AI Insights Card (if generated) */}
        {aiInsights && (
          <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 font-mono">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Synthesized Cognitive Reflection</span>
            </div>
            {aiInsights.summary && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {aiInsights.summary}
              </p>
            )}
            {aiInsights.reflectionQuestion && (
              <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/20 text-xs text-cyan-200 italic">
                <span className="font-semibold not-italic text-slate-400 block mb-1 font-mono">
                  Inquiry for you:
                </span>
                &ldquo;{aiInsights.reflectionQuestion}&rdquo;
              </div>
            )}
            {aiInsights.actionItem && (
              <div className="flex items-start gap-2 text-xs text-emerald-300">
                <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  <strong className="text-emerald-400 font-mono">Recommended Action:</strong> {aiInsights.actionItem}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tags Section */}
        <div className="pt-4 border-t border-white/8 flex flex-wrap items-center gap-2">
          <TagIcon className="w-3.5 h-3.5 text-slate-500" />
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/8 text-slate-300"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <div className="flex items-center gap-1">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag..."
              className="bg-white/4 text-xs text-white placeholder:text-slate-500 focus:outline-none w-24 px-2 py-1 border border-white/8 rounded-lg focus:border-cyan-500/50"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-1.5 py-1 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
