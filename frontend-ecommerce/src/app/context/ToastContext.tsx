'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, X } from 'lucide-react';

type ToastAction = { label: string; href: string };

type ToastItem = {
  id: number;
  message: string;
  detail?: string;
  includes?: string[];
  action?: ToastAction;
};

type ToastOptions = {
  detail?: string;
  includes?: string[];
};

type ToastContextType = {
  showToast: (message: string, action?: ToastAction, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, action?: ToastAction, options?: ToastOptions) => {
    const id = Date.now();
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        action,
        detail: options?.detail,
        includes: options?.includes?.filter((line) => line.trim() !== ''),
      },
    ]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, options?.includes?.length ? 7000 : 4500);
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-20 left-0 right-0 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-emerald-200/80 bg-white px-4 py-3 shadow-premium-lg ring-1 ring-black/[0.04]"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-success" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-ink">{toast.message}</p>
              {toast.detail && (
                <p className="mt-0.5 truncate text-xs font-medium text-brand-primary">{toast.detail}</p>
              )}
              {toast.includes && toast.includes.length > 0 && (
                <ul className="mt-1 max-h-24 space-y-0.5 overflow-y-auto text-[11px] leading-snug text-gray-600">
                  {toast.includes.slice(0, 6).map((line) => (
                    <li key={line} className="flex gap-1">
                      <span className="text-brand-primary">·</span>
                      <span>{line}</span>
                    </li>
                  ))}
                  {toast.includes.length > 6 && (
                    <li className="text-gray-400 italic">+{toast.includes.length - 6} más</li>
                  )}
                </ul>
              )}
              {toast.action && (
                <Link
                  href={toast.action.href}
                  className="mt-0.5 inline-block text-xs font-bold text-brand-primary hover:underline"
                >
                  {toast.action.label} →
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="touch-target shrink-0 rounded-full p-1 text-brand-muted hover:bg-slate-100"
              aria-label="Cerrar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
