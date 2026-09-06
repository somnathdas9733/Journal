import { ArrowRight, Sparkles, MessageSquare, Lightbulb, Compass, ChevronRight, PenTool } from 'lucide-react';

interface JournalHeroProps {
  onStartChat: () => void;
  onNewEntry: () => void;
  onOpenBrainstorm: () => void;
  onOpenPrompts: () => void;
  entryCount: number;
}

export function JournalHero({
  onStartChat,
  onNewEntry,
  onOpenBrainstorm,
  onOpenPrompts,
  entryCount,
}: JournalHeroProps) {
  return (
    <div id="paradigm-hero-container" className="relative w-full mb-12 select-none">
      {/* Stadium Curved Boundary Matching Screenshot */}
      <div className="paradigm-stadium-boundary p-8 sm:p-14 md:p-18 text-center">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />
        
        {/* Content Container */}
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          {/* Subtle Tagline / Paradigm Ecosystem Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-medium tracking-wide mb-7 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
            <span>Paradigm Intelligence &amp; Cognitive Architecture</span>
          </div>

          {/* Main Display Headline from Screenshot */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.14] mb-5 font-sans">
            Custom cognitive &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
              software solutions
            </span>
          </h1>

          {/* Subtitle from Screenshot */}
          <p className="text-sm sm:text-base text-slate-400 max-w-lg font-normal leading-relaxed mb-9">
            Delivering solutions today, built with quality that empowers your tomorrow.
          </p>

          {/* Signature "Let's talk >" Glint Button */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10">
            <button
              type="button"
              id="hero-btn-talk-ai"
              onClick={onStartChat}
              className="paradigm-glint-btn px-7 py-3 rounded-xl text-sm font-medium text-white flex items-center gap-2 cursor-pointer group"
            >
              <span>Let&apos;s talk</span>
              <ChevronRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              id="hero-btn-new-entry"
              onClick={onNewEntry}
              className="px-5 py-3 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/4 hover:bg-white/8 border border-white/10 hover:border-cyan-500/30 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <PenTool className="w-3.5 h-3.5 text-cyan-400" />
              <span>Write Reflection</span>
              <span className="text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded-full font-mono">
                {entryCount} records
              </span>
            </button>
          </div>

          {/* Futuristic Circuit & Conveyor Grid Accent (Evoking bottom 3D graphic in screenshot) */}
          <div className="relative w-full max-w-2xl h-24 sm:h-28 rounded-2xl border border-white/8 bg-[#040810]/70 backdrop-blur-md overflow-hidden flex items-center justify-between px-6 sm:px-10 paradigm-grid-pattern shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-t from-[#040810] via-transparent to-transparent pointer-events-none" />
            
            {/* Glowing Wireframe Nodes */}
            <div 
              onClick={onOpenBrainstorm}
              className="relative z-10 flex items-center gap-3 cursor-pointer group hover:scale-[1.02] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.2)] group-hover:border-cyan-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">Ideation Matrix</div>
                <div className="text-[11px] text-slate-400">First Principles &amp; SCAMPER</div>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-white/10" />

            <div 
              onClick={onOpenPrompts}
              className="relative z-10 flex items-center gap-3 cursor-pointer group hover:scale-[1.02] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-center text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:border-blue-400">
                <Compass className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">Cognitive Inquiries</div>
                <div className="text-[11px] text-slate-400">Targeting hidden blind spots</div>
              </div>
            </div>

            <div className="hidden md:block h-8 w-px bg-white/10" />

            <div 
              onClick={onStartChat}
              className="relative z-10 hidden md:flex items-center gap-3 cursor-pointer group hover:scale-[1.02] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:border-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Socratic AI</div>
                <div className="text-[11px] text-slate-400">Active dialogue companion</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
