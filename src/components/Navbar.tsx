import { 
  PenTool, 
  Lightbulb, 
  MessageSquare, 
  Compass, 
  BarChart3, 
  Download, 
  Plus, 
  ChevronRight, 
  LogOut, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'entries' | 'editor' | 'brainstorm' | 'chat' | 'prompts' | 'analytics';
  onSelectTab: (tab: 'entries' | 'editor' | 'brainstorm' | 'chat' | 'prompts' | 'analytics') => void;
  onNewEntry: () => void;
  onExportData: () => void;
  entryCount: number;
}

export function Navbar({
  activeTab,
  onSelectTab,
  onNewEntry,
  onExportData,
  entryCount,
}: NavbarProps) {
  const { user, signOut, isDemoUser } = useAuth();

  return (
    <header id="app-navbar" className="sticky top-0 z-40 w-full border-b border-white/8 bg-[#05080e]/85 backdrop-blur-xl shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Paradigm Brand */}
        <div 
          id="navbar-brand"
          onClick={() => onSelectTab('entries')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          {/* Folded Cyan Ribbon/Prism P Icon */}
          <div className="relative flex items-center justify-center">
            <svg className="w-6 h-6 shrink-0 filter drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" viewBox="0 0 28 28" fill="none">
              <path d="M6 4H16.5C20.6421 4 24 7.35786 24 11.5C24 15.6421 20.6421 19 16.5 19H12V24H6V4Z" fill="url(#p_gradient)" />
              <path d="M12 10H16C16.8284 10 17.5 10.6716 17.5 11.5C17.5 12.3284 16.8284 13 16 13H12V10Z" fill="#05080E" />
              <defs>
                <linearGradient id="p_gradient" x1="6" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38BDF8" />
                  <stop offset="0.5" stopColor="#00E5FF" />
                  <stop offset="1" stopColor="#0284C7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-white font-sans">Paradigm</span>
            <span className="hidden sm:inline-block text-[10px] font-mono font-medium text-cyan-400/90 tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
              Journal
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav id="navbar-nav-links" className="hidden lg:flex items-center gap-1 bg-white/3 border border-white/8 rounded-xl p-1 backdrop-blur-md">
          <button
            type="button"
            id="nav-tab-entries"
            onClick={() => onSelectTab('entries')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'entries'
                ? 'bg-white/10 text-cyan-300 shadow-sm border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Reflections</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300 font-mono">
              {entryCount}
            </span>
          </button>

          <button
            type="button"
            id="nav-tab-brainstorm"
            onClick={() => onSelectTab('brainstorm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'brainstorm'
                ? 'bg-white/10 text-cyan-300 shadow-sm border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Brainstorm</span>
          </button>

          <button
            type="button"
            id="nav-tab-chat"
            onClick={() => onSelectTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white/10 text-cyan-300 shadow-sm border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Socratic AI</span>
          </button>

          <button
            type="button"
            id="nav-tab-prompts"
            onClick={() => onSelectTab('prompts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'prompts'
                ? 'bg-white/10 text-cyan-300 shadow-sm border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Inquiries</span>
          </button>

          <button
            type="button"
            id="nav-tab-analytics"
            onClick={() => onSelectTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white/10 text-cyan-300 shadow-sm border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Right Actions & User Profile */}
        <div id="navbar-actions" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            id="btn-export-backup"
            onClick={onExportData}
            title="Export JSON Backup"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-white/3 hover:bg-white/6 border border-white/8 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* New Reflection Button */}
          <button
            type="button"
            id="btn-new-entry"
            onClick={onNewEntry}
            className="paradigm-glint-btn px-3.5 py-1.5 rounded-xl text-xs font-medium text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">New Reflection</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Authenticated User Pill & Sign Out */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-inner">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full ring-1 ring-cyan-500/40 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[10px] font-bold text-cyan-300">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left leading-none max-w-[110px]">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {user.displayName || 'Researcher'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    {isDemoUser ? (
                      <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-1 rounded">DEMO</span>
                    ) : (
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                    )}
                    <span className="truncate">{user.email || 'Isolated session'}</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={signOut}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="lg:hidden flex items-center justify-around border-t border-white/8 bg-[#070b12] px-2 py-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => onSelectTab('entries')}
          className={`px-2.5 py-1 text-xs rounded-md ${activeTab === 'entries' ? 'text-cyan-300 font-semibold bg-white/10 border border-cyan-500/30' : 'text-slate-400'}`}
        >
          Reflections
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('brainstorm')}
          className={`px-2.5 py-1 text-xs rounded-md ${activeTab === 'brainstorm' ? 'text-cyan-300 font-semibold bg-white/10 border border-cyan-500/30' : 'text-slate-400'}`}
        >
          Brainstorm
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('chat')}
          className={`px-2.5 py-1 text-xs rounded-md ${activeTab === 'chat' ? 'text-cyan-300 font-semibold bg-white/10 border border-cyan-500/30' : 'text-slate-400'}`}
        >
          Socratic AI
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('prompts')}
          className={`px-2.5 py-1 text-xs rounded-md ${activeTab === 'prompts' ? 'text-cyan-300 font-semibold bg-white/10 border border-cyan-500/30' : 'text-slate-400'}`}
        >
          Inquiries
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('analytics')}
          className={`px-2.5 py-1 text-xs rounded-md ${activeTab === 'analytics' ? 'text-cyan-300 font-semibold bg-white/10 border border-cyan-500/30' : 'text-slate-400'}`}
        >
          Analytics
        </button>
      </div>
    </header>
  );
}
