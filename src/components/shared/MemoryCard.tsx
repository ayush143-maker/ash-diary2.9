'use client';

import React from 'react';
import type { JournalEntry } from '@/types';
import { useSettings } from '@/context/SettingsProvider';
import { formatDate } from '@/lib/dates';
import { cn } from '@/lib/cn';
import { IconChevronRight } from '../icons';

interface MemoryCardProps {
  entry: JournalEntry;
  onClick?: () => void;
  className?: string;
}

/** Strip Markdown-lite syntax into a plain-text excerpt. */
function toExcerpt(body: string, maxLength = 180): string {
  const text = body
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/---/g, ' ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();

  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}

/**
 * The "latest memory" card on the ME tab.
 * Larger, serif-forward, slightly cinematic — distinct from list cards.
 */
export function MemoryCard({ entry, onClick, className }: MemoryCardProps) {
  const { settings } = useSettings();

  return (
    <button
      onClick={onClick}
      className={cn(
        'press bg-surface border-line rounded-card relative block w-full overflow-hidden border p-6 text-left',
        'hover:border-line-2 transition-colors',
        className
      )}
    >
      {/* Ember glow accent */}
      <div
        aria-hidden="true"
        className="bg-ember absolute -top-12 -right-12 h-36 w-36 rounded-full opacity-[0.06] blur-2xl"
      />

      <span className="text-ember text-[11px] font-semibold tracking-[0.22em] uppercase">
        Latest memory
      </span>

      <h3 className="font-display text-ink mt-2.5 text-2xl leading-snug font-medium">
        {entry.title || 'Untitled'}
      </h3>

      <p className="text-ink-2 mt-2.5 line-clamp-3 text-sm leading-relaxed">
        {toExcerpt(entry.body)}
      </p>

      <div className="mt-5 flex items-center justify-between">
        {settings.showTimestamps ? (
          <time className="text-ink-3 text-xs">{formatDate(entry.createdAt)}</time>
        ) : (
          <span />
        )}
        <span className="text-ink-3 inline-flex items-center gap-0.5 text-xs font-medium">
          Continue reading
          <IconChevronRight size={14} />
        </span>
      </div>
    </button>
  );
}
