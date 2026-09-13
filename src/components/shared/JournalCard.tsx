'use client';

import React from 'react';
import type { JournalEntry } from '@/types';
import { useSettings } from '@/context/SettingsProvider';
import { formatDate } from '@/lib/dates';
import { cn } from '@/lib/cn';
import { MoodBadge } from './MoodBadge';
import { Sprig } from './Sprig';
import { IconMic } from '../icons';

interface JournalCardProps {
  entry: JournalEntry;
  onClick?: () => void;
  className?: string;
}

/** Strip Markdown-lite syntax into a plain-text preview. */
function toPreview(body: string, maxLength = 140): string {
  const text = body
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/---/g, ' ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();

  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}

export function JournalCard({ entry, onClick, className }: JournalCardProps) {
  const { settings } = useSettings();
  const hasVoice = entry.voiceMemoryIds.length > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'press bg-surface border-line rounded-card block w-full border p-5 text-left',
        'hover:border-line-2 transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {settings.showTimestamps && (
            <time className="text-ink-3 text-[11px] font-semibold tracking-[0.18em] uppercase">
              {formatDate(entry.createdAt)}
            </time>
          )}
          {entry.mood && <MoodBadge mood={entry.mood} />}
        </div>
        <Sprig seed={entry.mood ?? entry.id} size={32} className="text-ok/70 shrink-0" />
      </div>

      <h3 className="font-display text-ink mt-2.5 text-lg leading-snug font-medium">
        {entry.title || 'Untitled'}
      </h3>

      <p className="text-ink-2 mt-1.5 line-clamp-2 text-sm leading-relaxed">
        {toPreview(entry.body) || 'No words yet — just a moment kept.'}
      </p>

      {hasVoice && (
        <span className="text-ember mt-3 inline-flex items-center gap-1.5 text-xs font-medium">
          <IconMic size={13} />
          Voice memory
        </span>
      )}
    </button>
  );
}
