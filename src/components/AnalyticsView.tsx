import { useMemo } from 'react';
import { 
  BarChart3, 
  Flame, 
  BookOpen, 
  TrendingUp, 
  Tag as TagIcon, 
  Compass, 
  Sparkles,
  Calendar
} from 'lucide-react';
import { JournalEntry, MoodType } from '../types';
import { MOOD_CONFIGS } from '../utils/constants';

interface AnalyticsViewProps {
  entries: JournalEntry[];
}

export function AnalyticsView({ entries }: AnalyticsViewProps) {
  const stats = useMemo(() => {
    let totalWords = 0;
    const moodCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    entries.forEach((e) => {
      const words = e.content.trim() ? e.content.trim().split(/\s+/).length : 0;
      totalWords += words;

      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;

      e.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Calculate approximate streak
    const dates = Array.from(
      new Set(entries.map((e) => new Date(e.createdAt).toDateString()))
    );

    return {
      totalEntries: entries.length,
      totalWords,
      avgWordsPerEntry: entries.length > 0 ? Math.round(totalWords / entries.length) : 0,
      streakDays: Math.min(dates.length, 7), // active days in recent batch
      moodCounts,
      topTags,
    };
  }, [entries]);

  return (
    <div id="analytics-view-container" className="max-w-4xl mx-auto space-y-8">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-2xl bg-[#080d17]/85 border border-white/8 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-400">Total Entries</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
            {stats.totalEntries}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Reflections logged</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#080d17]/85 border border-white/8 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-400">Words Authored</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
            {stats.totalWords.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">~{stats.avgWordsPerEntry} words/entry</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#080d17]/85 border border-white/8 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-400">Active Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
            {stats.streakDays} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Consistency momentum</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#080d17]/85 border border-white/8 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-400">Themes Tracked</span>
            <TagIcon className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
            {stats.topTags.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Unique focal points</p>
        </div>
      </div>

      {/* Mood Distribution Breakdown */}
      <div className="rounded-3xl border border-white/8 bg-[#080d17]/90 backdrop-blur-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight font-sans">
              Cognitive State Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Breakdown of mental states recorded across your journaling archive.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1 rounded-xl font-semibold">
            {stats.totalEntries} Total
          </span>
        </div>

        <div className="space-y-3.5 pt-2">
          {(Object.keys(MOOD_CONFIGS) as MoodType[]).map((mKey) => {
            const cfg = MOOD_CONFIGS[mKey];
            const count = stats.moodCounts[mKey] || 0;
            const percentage = stats.totalEntries > 0 ? Math.round((count / stats.totalEntries) * 100) : 0;

            return (
              <div key={mKey} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shadow-[0_0_6px_currentColor]"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <span className="font-medium text-slate-200">{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-slate-400">
                    <span className="text-white">{count}</span>
                    <span className="text-slate-500">({percentage}%)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/4">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: cfg.color,
                      boxShadow: `0 0 10px ${cfg.color}`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Concepts / Tags */}
      <div className="rounded-3xl border border-white/8 bg-[#080d17]/90 backdrop-blur-2xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <h3 className="text-base font-bold text-white tracking-tight font-sans">
          Recurring Topics &amp; Focal Points
        </h3>
        <p className="text-xs text-slate-400">
          Most frequent strategic areas explored in your writing.
        </p>

        <div className="flex flex-wrap gap-2.5 pt-2">
          {stats.topTags.map(({ tag, count }) => (
            <div
              key={tag}
              className="px-3.5 py-2 rounded-xl bg-white/4 border border-white/8 flex items-center gap-2 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all shadow-md"
            >
              <TagIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-200">{tag}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 font-mono border border-white/5">
                {count}
              </span>
            </div>
          ))}
          {stats.topTags.length === 0 && (
            <p className="text-xs text-slate-500 italic">No tags recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
