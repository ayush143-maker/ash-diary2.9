import React from 'react';
import type { Mood } from '@/types';
import { cn } from '@/lib/cn';

/**
 * Canonical mood metadata — used by the badge, the editor's MoodSelector
 * (Bundle 10), and settings' default-mood picker (Bundle 8).
 */
export const MOOD_META: Record<Mood, { label: string }> = {
  calm: { label: 'Calm' },
  grateful: { label: 'Grateful' },
  hopeful: { label: 'Hopeful' },
  tired: { label: 'Tired' },
  anxious: { label: 'Anxious' },
  heavy: { label: 'Heavy' },
  alive: { label: 'Alive' },
};

export const ALL_MOODS = Object.keys(MOOD_META) as Mood[];

interface MoodBadgeProps {
  mood: Mood;
  size?: 'sm' | 'md';
  className?: string;
}

export function MoodBadge({ mood, size = 'sm', className }: MoodBadgeProps) {
  const meta = MOOD_META[mood];

  return (
    <span
      className={cn(
        'border-line bg-surface-2 text-ink-2 inline-flex items-center gap-1.5 rounded-full border',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
      title={`Mood: ${meta.label}`}
    >
      <span aria-hidden="true" className="bg-ink-3 h-1 w-1 rounded-full" />
      <span className="font-medium">{meta.label}</span>
    </span>
  );
}
