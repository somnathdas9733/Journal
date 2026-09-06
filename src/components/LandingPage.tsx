import React, { useState } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { signInWithGoogle, isConfigured, loading } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      if (!isConfigured) {
        setErrorMsg('Firebase configuration missing. Please ensure your VITE_FIREBASE_* variables are set in .env.');
        return;
      }
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      setErrorMsg(err?.message || 'Google authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#05080e] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-48 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 -left-48 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="font-bold tracking-wider text-base bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent font-mono">
                PARADIGM
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-cyan-400/80 uppercase tracking-widest border-l border-slate-800 pl-2">
                Socratic Journal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-all flex items-center gap-2 shadow-sm"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center z-10">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-8 backdrop-blur-md shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>GEMINI 3.6 FLASH ENGINE & CLOUD FIRESTORE ISOLATION</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12]">
          Deconstruct your thoughts.{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Reflect with Socratic Clarity.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          A private cognitive sanctuary. Engage in multi-turn reflective dialogues with Gemini, untangle mental models, and archive insights isolated strictly to your account.
        </p>

        {/* Auth Error Banner */}
        {errorMsg && (
          <div className="mt-6 max-w-md w-full p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-sm flex items-start gap-3 text-left">
            <span className="text-red-400 mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold text-red-100">Authentication Notice</p>
              <p className="text-xs text-red-300 mt-1">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Primary Call to Action */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-3 group"
          >
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shadow-sm">
              <GoogleIcon className="w-4 h-4" />
            </div>
            <span>Sign in with Google</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>Paradigm Cognitive Journal • Powered by Gemini 3.6 Flash & Cloud Firestore Isolation</p>
      </footer>
    </div>
  );
};

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
        fill="#EA4335"
      />
    </svg>
  );
}
