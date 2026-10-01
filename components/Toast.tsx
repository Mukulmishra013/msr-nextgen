'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface ToastOptions {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = useCallback(({ message, type = 'info', duration = 4000 }: ToastOptions) => {
    setToast({ message, type, duration });
    const timer = setTimeout(() => {
      setToast(null);
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92%] sm:w-auto animate-chat-in">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md text-sm font-medium ${
              toast.type === 'error'
                ? 'bg-rose-950/90 text-white border-rose-700'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 text-amber-100 border-amber-600'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-600'
                : 'bg-slate-900/90 text-slate-100 border-slate-700'
            }`}
          >
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-teal-400 shrink-0" />}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-white/10 rounded-md transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4 opacity-70" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
