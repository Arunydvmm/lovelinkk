import { useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type ToastKind = 'success' | 'error';

interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

// Tiny shared store so the hook (used for triggering) and <UploadToasts />
// (used for rendering) stay in sync without needing a Provider.
let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(l => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return toasts;
}

function dismiss(id: number) {
  toasts = toasts.filter(t => t.id !== id);
  emit();
}

function push(kind: ToastKind, title: string, message?: string, duration = 3500) {
  const id = nextId++;
  // Keep at most 4 toasts on screen.
  toasts = [...toasts, { id, kind, title, message }].slice(-4);
  emit();
  window.setTimeout(() => dismiss(id), duration);
}

export function useUploadToasts() {
  const notifyUploaded = useCallback((what: string = 'file') => {
    const label = what.charAt(0).toUpperCase() + what.slice(1);
    push('success', `${label} uploaded`);
  }, []);

  const notifyError = useCallback((title: string, message?: string) => {
    push('error', title, message, 5500);
  }, []);

  return { notifyUploaded, notifyError };
}

export function UploadToasts() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return (
    <div
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
    >
      <AnimatePresence>
        {items.map(t => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur bg-white/95 ${
              t.kind === 'error' ? 'border-red-200' : 'border-emerald-200'
            }`}
          >
            {t.kind === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{t.title}</p>
              {t.message && <p className="text-xs text-gray-600 mt-0.5 break-words">{t.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default UploadToasts;
