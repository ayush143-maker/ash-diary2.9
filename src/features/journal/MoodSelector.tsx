'use client';

import React, { useState } from 'react';
import type { Mood } from '@/types';
import { ALL_MOODS, MOOD_META } from '@/components/shared/MoodBadge';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { IconCheck, IconTag } from '@/components/icons';
import { cn } from '@/lib/cn';

interface MoodSelectorProps {
  value: Mood | undefined;
  onChange: (mood: Mood | undefined) => void;
}

/**
 * A single "Tag" trigger that opens a list-style picker sheet, instead
 * of an inline scrollable chip row (which had no room to breathe and
 * always cut off mid-chip at the screen edge).
 */
export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'press inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
          value
            ? 'bg-ember-wash border-ember/30 text-ember'
            : 'text-ink-2 hover:text-ink border-line bg-surface-2'
        )}
      >
        <IconTag size={15} />
        {value ? MOOD_META[value].label : 'Tag'}
      </button>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Tag this entry">
        <div className="space-y-1 pb-2">
          {ALL_MOODS.map((mood) => {
            const active = value === mood;
            return (
              <button
                key={mood}
                onClick={() => {
                  onChange(active ? undefined : mood);
                  setOpen(false);
                }}
                aria-pressed={active}
                className={cn(
                  'flex w-full items-center justify-between rounded-control px-4 py-3 text-left text-[15px] transition-colors',
                  active ? 'bg-ember-wash text-ember font-medium' : 'text-ink hover:bg-surface-2'
                )}
              >
                {MOOD_META[mood].label}
                {active && <IconCheck size={16} />}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
