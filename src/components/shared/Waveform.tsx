'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';

interface WaveformProps {
  /** Deterministic shape source — usually the voice memory's id. */
  seed?: string;
  /** Explicit bar values (0..1). Used by the live recorder. */
  values?: number[];
  barCount?: number;
  /** Playback progress 0..1 — bars before it are lit. */
  progress?: number;
  /** Breathing animation for the recording state. */
  animated?: boolean;
  className?: string;
}

/** FNV-1a hash → xorshift PRNG: stable, dependency-free waveform shapes. */
function seededValues(seed: string, count: number): number[] {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const values: number[] = [];
  for (let i = 0; i < count; i++) {
    hash ^= hash << 13;
    hash ^= hash >>> 17;
    hash ^= hash << 5;
    values.push(0.22 + ((hash >>> 0) % 1000) / 1000 * 0.78);
  }
  return values;
}

export function Waveform({
  seed = 'ash',
  values,
  barCount = 36,
  progress = 0,
  animated = false,
  className,
}: WaveformProps) {
  const bars = useMemo(
    () => values ?? seededValues(seed, barCount),
    [values, seed, barCount]
  );

  const playedCount = Math.floor(progress * bars.length);

  return (
    <div
      className={cn('flex h-8 items-center gap-[2.5px]', className)}
      aria-hidden="true"
    >
      {bars.map((value, index) => {
        const played = index < playedCount;
        return (
          <span
            key={index}
            className={cn(
              'w-[3px] origin-center rounded-full transition-colors duration-200',
              played ? 'bg-ember' : 'bg-ink-3/30',
              animated && 'animate-wave'
            )}
            style={{
              height: `${Math.round(value * 100)}%`,
              animationDelay: animated ? `${index * 45}ms` : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
