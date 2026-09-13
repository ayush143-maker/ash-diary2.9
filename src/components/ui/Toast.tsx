'use client';

import React from 'react';
import { useToast } from '@/context/ToastProvider';
import { IconCheck, IconX, IconInfo } from '../icons';
import { cn } from '@/lib/cn';

export function ToastViewport() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-[70] flex flex-col items-center gap-2 pointer-events-none px-4 pt-safe">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto w-full max-w-sm bg-surface-2 border border-line shadow-card rounded-control px-4 py-3 flex items-center gap-3 animate-toast-in",
            toast.type === 'error' && "border-danger-wash bg-danger-wash",
            toast.type === 'success' && "border-ok-wash bg-ok-wash"
          )}
        >
          {toast.type === 'success' && <IconCheck size={18} className="text-ok" />}
          {toast.type === 'error' && <IconX size={18} className="text-danger" />}
          {toast.type === 'info' && <IconInfo size={18} className="text-ember" />}
          <p className="text-sm text-ink flex-1">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="text-ink-3 hover:text-ink p-1">
            <IconX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
