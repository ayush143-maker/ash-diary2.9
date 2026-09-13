import React from 'react';
import { cn } from '@/lib/cn';
import { IconCalendar } from '../icons';

interface CalendarButtonProps {
  onClick: () => void;
  /** Highlights the button when a date filter is active. */
  active?: boolean;
  className?: string;
}

/**
 * Trigger for the month calendar sheet (CalendarSheet lands in Bundle 9).
 */
export function CalendarButton({ onClick, active = false, className }: CalendarButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Open calendar"
      aria-pressed={active}
      className={cn(
        'press flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors',
        active
          ? 'bg-ember-wash border-ember/30 text-ember'
          : 'bg-surface-2 border-line text-ink-2 hover:border-line-2 hover:text-ink'
      )}
    >
      <IconCalendar size={18} />
    </button>
  );
}
