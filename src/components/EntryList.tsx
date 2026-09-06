import { useState, useMemo } from 'react';
import { 
  Search, 
  PenTool, 
  Trash2, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Sparkles, 
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { JournalEntry, MoodType } from '../types';
import { MOOD_CONFIGS } from '../utils/constants';

interface EntryListProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onNewEntry: () => void;
  onChatAboutEntry: (entry: JournalEntry) => void;
}

export function EntryList({
  entries,
  onSelectEntry,
  onDeleteEntry,
  onNewEntry,
  onChatAboutEntry,
}: EntryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !q ||
          entry.title.toLowerCase().includes(q) ||
          entry.content.toLowerCase().includes(q) ||
          entry.tags.some((t) => t.toLowerCase().includes(q));
        return matchesMood && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [entries, searchQuery, selectedMood, sortOrder]);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div id="entry-list-container" className="space-y-6">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#080d17]/85 border border-white/8 backdrop-blur-xl shadow-lg">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            id="input-search-entries"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reflections, tags, or concepts..."
            className="w-full pl-10 pr-4 py-2 bg-white/4 text-xs text-white placeholder:text-slate-500 focus:outline-none rounded-xl border border-white/8 focus:border-cyan-500/50 focus:bg-white/6 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Mood Filter and Sort */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            id="select-mood-filter"
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value as any)}
            className="bg-[#0e1626] text-xs text-slate-300 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="all">All States</option>
            {(Object.keys(MOOD_CONFIGS) as MoodType[]).map((m) => (
              <option key={m} value={m}>
                {MOOD_CONFIGS[m].label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/4 hover:bg-white/8 border border-white/8 hover:border-cyan-500/30 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="capitalize">{sortOrder}</span>
          </button>
        </div>
      </div>

      {/* Entry Cards Grid */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-white/8 bg-[#080d17]/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
            <PenTool className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No journal reflections found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedMood !== 'all'
              ? 'Try adjusting your search query or cognitive state filter.'
              : 'Start your personal archive of thoughts, decisions, and strategic reflections.'}
          </p>
          <button
            type="button"
            onClick={onNewEntry}
            className="paradigm-glint-btn px-5 py-2.5 rounded-xl text-xs font-medium text-white inline-flex items-center gap-1.5 cursor-pointer mt-2"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-300" />
            <span>Create New Reflection</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => {
            const moodCfg = MOOD_CONFIGS[entry.mood] || MOOD_CONFIGS['deep-focus'];
            const wordCount = entry.content.trim() ? entry.content.trim().split(/\s+/).length : 0;
            const readMins = Math.max(1, Math.ceil(wordCount / 200));

            return (
              <div
                key={entry.id}
                id={`entry-card-${entry.id}`}
                className="group relative p-5 rounded-2xl border border-white/8 bg-[#090e18]/85 hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgba(0,229,255,0.1)] transition-all duration-200 flex flex-col justify-between"
              >
                {/* Header Meta */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${moodCfg.badgeClass}`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shadow-[0_0_6px_currentColor]"
                        style={{ backgroundColor: moodCfg.color }}
                      />
                      {moodCfg.label}
                    </span>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.createdAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {readMins}m
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => onSelectEntry(entry)}
                    className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors cursor-pointer line-clamp-1 mb-2 font-sans"
                  >
                    {entry.title || 'Untitled Reflection'}
                  </h3>

                  {/* Excerpt */}
                  <p
                    onClick={() => onSelectEntry(entry)}
                    className="text-xs text-slate-400 line-clamp-3 leading-relaxed cursor-pointer mb-4"
                  >
                    {entry.content}
                  </p>

                  {/* AI Insight Snippet (if available) */}
                  {entry.aiInsights?.summary && (
                    <div className="mb-4 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/25 text-[11px] text-cyan-200 leading-snug flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{entry.aiInsights.summary}</span>
                    </div>
                  )}
                </div>

                {/* Footer and Quick Actions */}
                <div className="pt-3 border-t border-white/6 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1 max-w-[65%]">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/8"
                      >
                        #{tag}
                      </span>
                    ))}
                    {entry.tags.length > 3 && (
                      <span className="text-[10px] text-slate-500">
                        +{entry.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onChatAboutEntry(entry)}
                      title="Reflect on this entry with AI Companion"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/8 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectEntry(entry)}
                      title="Edit Entry"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete reflection "${entry.title}"?`)) {
                          onDeleteEntry(entry.id);
                        }
                      }}
                      title="Delete Entry"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
