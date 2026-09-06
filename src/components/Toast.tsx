import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className={`pointer-events-auto p-4 rounded-2xl border bg-[#080d17]/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 flex items-start gap-3 text-slate-200 ${
            toast.type === 'error'
              ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
              : toast.type === 'success'
              ? 'border-cyan-500/40 shadow-[0_0_20px_rgba(0,229,255,0.15)]'
              : 'border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 mt-1.5 animate-pulse shadow-[0_0_8px_#00e5ff]" />
          )}

          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold tracking-tight text-white font-sans">{toast.title}</div>
            {toast.message && (
              <p className="text-xs text-slate-400 mt-1 leading-relaxed break-words">{toast.message}</p>
            )}
            {toast.actionLabel && toast.onAction && (
              <button
                type="button"
                onClick={toast.onAction}
                className="mt-2 text-xs font-semibold px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-cyan-300 transition-colors border border-white/10 cursor-pointer"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
