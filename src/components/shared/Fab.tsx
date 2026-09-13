import React from 'react';
import { cn } from '@/lib/cn';

interface FabProps {
  onClick: () => void;
  'aria-label': string;
  icon: React.ReactNode;
  className?: string;
}

/**
 * Small floating action button, pinned bottom-right above the bottom nav.
 * Fixed 76px offset rather than env(safe-area-inset-bottom) — that env
 * var is unreliable on Android WebViews (see globals.css pb-safe note),
 * and a fixed value is simpler to reason about for a single small button.
 */
export function Fab({ onClick, icon, className, ...rest }: FabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'press bg-ember text-on-ember shadow-card fixed right-5 bottom-[76px] z-30 flex h-14 w-14 items-center justify-center rounded-full',
        className
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
