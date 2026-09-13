'use client';

import React from 'react';
import type { Mood } from '@/types';
import { Chip } from '@/components/ui/Chip';
import { MOOD_META, ALL_MOODS } from '@/components/shared/MoodBadge';
import { IconMic } from '@/components/icons';

/** Single-select filter: everything, voice-attached entries, or one mood. */
export type JournalFilter = 'all' | 'voice' | Mood;

interface JournalFiltersProps {
  value: JournalFilter;
  onChange: (filter: JournalFilter) => void;
}

export function JournalFilters({ value, onChange }: JournalFiltersProps) {
  return (
    <div className="relative -mx-5">
      <div
        className="no-scrollbar flex gap-2 overflow-x-auto px-5"
        role="group"
        aria-label="Filter entries"
      >
        <Chip label="All" active={value === 'all'} onClick={() => onChange('all')} />
        <Chip
          label="Voice"
          icon={<IconMic size={13} />}
          active={value === 'voice'}
          onClick={() => onChange('voice')}
        />
        {ALL_MOODS.map((mood) => (
          <Chip
            key={mood}
            label={MOOD_META[mood].label}
            active={value === mood}
            onClick={() => onChange(mood)}
          />
        ))}
      </div>
      {/* Fade hints that the row scrolls, instead of just cutting off mid-chip */}
      <div className="from-canvas pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l to-transparent" />
    </div>
  );
}
