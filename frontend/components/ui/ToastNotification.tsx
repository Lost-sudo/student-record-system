'use client';

import React from 'react';

interface ToastProps {
  toast: {
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  } | null;
  onDismiss: () => void;
}

export default function ToastNotification({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <div
        className={`pointer-events-auto glass rounded-2xl border shadow-2xl shadow-indigo-900/30 p-4 flex items-start gap-3 min-w-[320px] max-w-md toast-in ${
          toast.type === 'success'
            ? 'border-emerald-500/30 bg-emerald-500/10'
            : toast.type === 'error'
            ? 'border-red-500/30 bg-red-500/10'
            : 'border-indigo-500/30 bg-indigo-500/10'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {toast.type === 'success' && (
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.type === 'info' && (
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white">{toast.title}</div>
          <div className="text-xs text-slate-300 mt-0.5">{toast.message}</div>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
