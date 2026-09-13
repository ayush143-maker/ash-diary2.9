'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import type { VoiceMemory } from '@/types';
import { useSettings } from '@/context/SettingsProvider';
import { formatDuration } from '@/lib/format';
import { formatDate, getRelativeTime } from '@/lib/dates';
import { cn } from '@/lib/cn';
import { Waveform } from './Waveform';
import { Sprig } from './Sprig';
import { IconPause, IconPlay } from '../icons';

interface VoiceMemoryCardProps {
  memory: VoiceMemory;
  /** 'default' for the VOICE tab · 'compact' for the ME home screen. */
  variant?: 'default' | 'compact';
  className?: string;
}

/**
 * Only one <audio> element in the app plays at a time. Every card checks
 * this before starting playback and pauses whatever was previously
 * playing — otherwise two cards can show "playing" simultaneously with
 * no coordination between them (confirmed happening before this fix).
 */
let currentlyPlaying: HTMLAudioElement | null = null;

/**
 * Voice memory item.
 *
 * Real playback via an <audio> element when memory.audioSrc is a local
 * file (converted through Capacitor.convertFileSrc for native file://
 * URIs, since the WebView cannot load those directly). Falls back to the
 * Phase 1 simulated timer for seed/legacy entries saved without audio.
 *
 * `playing` is never set directly from the toggle handler — it only
 * mirrors the <audio> element's own play/pause/ended events. Setting it
 * by hand (the old approach) is what let it drift out of sync with the
 * actual media element, which is why replaying a clip after it finished
 * silently did nothing: the element's real playback position was still
 * sitting at the end, and only the React state had been reset to 0.
 *
 * The date/relative-time line respects the "Show timestamps" setting
 * (Settings → General → Journal), so turning it off truly hides dates
 * everywhere instead of the toggle being inert.
 */
export function VoiceMemoryCard({
  memory,
  variant = 'default',
  className,
}: VoiceMemoryCardProps) {
  const { settings } = useSettings();
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasAudio = Boolean(memory.audioSrc);
  const playableSrc = hasAudio
    ? Capacitor.isNativePlatform()
      ? Capacitor.convertFileSrc(memory.audioSrc as string)
      : (memory.audioSrc as string)
    : undefined;

  // Simulated progress for entries with no real audio attached.
  useEffect(() => {
    if (!playing || hasAudio) return;
    simIntervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.1;
        if (next >= memory.durationSec) {
          setPlaying(false);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [playing, hasAudio, memory.durationSec]);

  const toggle = useCallback(() => {
    if (!hasAudio || !audioRef.current) {
      setPlaying((prev) => !prev); // simulated fallback, no real element to defer to
      return;
    }

    const audio = audioRef.current;
    if (!audio.paused) {
      audio.pause();
      return;
    }

    if (currentlyPlaying && currentlyPlaying !== audio) {
      currentlyPlaying.pause();
    }
    if (audio.ended || audio.currentTime >= (audio.duration || memory.durationSec)) {
      audio.currentTime = 0;
    }
    currentlyPlaying = audio;
    audio.play().catch(() => {
      /* onPause/onPlay events keep `playing` accurate either way */
    });
  }, [hasAudio, memory.durationSec]);

  // Release the shared pointer if this card unmounts mid-playback.
  useEffect(() => {
    const audioEl = audioRef.current;
    return () => {
      if (currentlyPlaying === audioEl) currentlyPlaying = null;
    };
  }, []);

  const progress = memory.durationSec > 0 ? elapsed / memory.durationSec : 0;
  const compact = variant === 'compact';

  return (
    <div
      className={cn(
        'bg-surface border-line rounded-card flex items-center border',
        compact ? 'gap-3 p-3' : 'gap-4 p-4',
        className
      )}
    >
      {hasAudio && (
        <audio
          ref={audioRef}
          src={playableSrc}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
          onEnded={(e) => {
            setPlaying(false);
            setElapsed(0);
            e.currentTarget.currentTime = 0;
            if (currentlyPlaying === e.currentTarget) currentlyPlaying = null;
          }}
        />
      )}

      <button
        onClick={toggle}
        aria-label={playing ? `Pause ${memory.title}` : `Play ${memory.title}`}
        className={cn(
          'press bg-ember text-on-ember flex shrink-0 items-center justify-center rounded-full',
          compact ? 'h-10 w-10' : 'h-12 w-12'
        )}
      >
        {playing ? (
          <IconPause size={compact ? 16 : 18} />
        ) : (
          <IconPlay size={compact ? 16 : 18} className="translate-x-[1px]" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className={cn('text-ink truncate font-medium', compact ? 'text-sm' : 'text-[15px]')}>
            {memory.title}
          </h3>
          <span className="tnum text-ink-3 shrink-0 text-xs">
            {formatDuration(memory.durationSec)}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <Waveform
            seed={memory.id}
            progress={progress}
            barCount={compact ? 24 : 36}
            className={cn('flex-1', compact ? 'h-6' : 'h-8')}
          />
          {!compact && <Sprig seed={memory.id} size={26} className="text-ok/60 shrink-0" />}
        </div>

        {/* Date line — hidden entirely when "Show timestamps" is off.
            (Compact variant never showed it anyway.) */}
        {!compact && settings.showTimestamps && (
          <p className="text-ink-3 mt-2 text-[11px]">
            {formatDate(memory.createdAt)} · {getRelativeTime(memory.createdAt)}
          </p>
        )}
      </div>
    </div>
  );
}
