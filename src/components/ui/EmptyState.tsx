import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 animate-fade-up">
      <div className="w-16 h-16 rounded-full bg-surface-2 border border-line flex items-center justify-center text-ink-3 mb-5">
        {icon}
      </div>
      <h3 className="font-display text-xl font-medium text-ink">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-ink-2 max-w-[260px] leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
