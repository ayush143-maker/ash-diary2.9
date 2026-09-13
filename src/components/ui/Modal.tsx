'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'primary';
}

export function Modal({ 
  isOpen, onClose, title, description, 
  confirmLabel = 'Confirm', cancelLabel = 'Cancel', 
  onConfirm, variant = 'primary' 
}: ModalProps) {
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute inset-0 bg-scrim animate-scrim-in" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-sm bg-surface rounded-card border border-line shadow-card p-6 animate-scale-in">
        <h3 className="font-display text-xl font-medium text-ink">{title}</h3>
        {description && <p className="mt-2 text-sm text-ink-2 leading-relaxed">{description}</p>}
        
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
