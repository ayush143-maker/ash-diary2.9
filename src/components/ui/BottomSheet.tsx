'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconX } from '../icons';
import { cn } from '@/lib/cn';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Rendered below the scrollable body, always visible without scrolling. */
  footer?: React.ReactNode;
  className?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, footer, className }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in">
      <div 
        className="absolute inset-0 bg-scrim animate-scrim-in" 
        onClick={onClose} 
        aria-hidden="true"
      />
      <div 
        ref={sheetRef}
        className={cn(
          "relative w-full max-w-[430px] bg-surface rounded-t-panel border-t border-line shadow-card p-6 pb-safe animate-sheet-up flex flex-col max-h-[85vh]",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-line-2 rounded-full" />
        
        {title && (
          <div className="flex items-center justify-between mb-4 mt-2">
            <h3 className="font-display text-xl font-medium text-ink">{title}</h3>
            <button onClick={onClose} className="p-2 -mr-2 text-ink-2 hover:text-ink transition-colors">
              <IconX size={20} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto no-scrollbar flex-1">
          {children}
        </div>
        {footer && <div className="border-line mt-3 border-t pt-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
