import React from 'react';
import { cn } from '@/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer", disabled && "opacity-50 cursor-not-allowed")}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div className={cn(
          "w-11 h-6 rounded-full transition-colors",
          checked ? "bg-ember" : "bg-surface-3"
        )} />
        <div className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform",
          checked && "translate-x-5"
        )} />
      </div>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  );
}
