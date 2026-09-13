import React from 'react';
import { cn } from '@/lib/cn';

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export function Chip({ label, active = false, onClick, icon }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "press inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-sm font-medium border transition-colors",
        active 
          ? "bg-ember-wash border-ember/30 text-ember" 
          : "bg-surface-2 border-line text-ink-2 hover:text-ink hover:border-line-2"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
