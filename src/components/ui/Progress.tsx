import React from 'react';
import { cn } from '@/lib/cn';

interface ProgressProps {
  value: number; // 0-100
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <div className={cn("w-full h-1.5 bg-surface-3 rounded-full overflow-hidden", className)}>
      <div 
        className="h-full bg-ember transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
