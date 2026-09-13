import React from 'react';
import { cn } from '@/lib/cn';

interface Option<T> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string | number>({ 
  options, value, onChange 
}: SegmentedControlProps<T>) {
  return (
    <div className="bg-surface-3 rounded-control p-1 flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 py-2 px-3 text-sm font-medium rounded-[8px] transition-all",
            value === opt.value 
              ? "bg-surface text-ink shadow-sm" 
              : "text-ink-2 hover:text-ink"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
