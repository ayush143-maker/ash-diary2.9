'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJournal } from '@/context/JournalProvider';
import { useProfile } from '@/context/ProfileProvider';
import { MemoryCard } from '@/components/shared/MemoryCard';
import { VoiceMemoryCard } from '@/components/shared/VoiceMemoryCard';
import { ImageFrame } from '@/components/shared/ImageFrame';
import { Sprig } from '@/components/shared/Sprig';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconBook, IconX } from '@/components/icons';
import { IMAGE_PATHS } from '@/lib/constants';
import { getRelativeTime } from '@/lib/dates';

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * ME — the personal home / memory space.
 *
 * Intentionally quiet: wordmark, one photo frame, a greeting,
 * the month at a glance, and the two most recent memories.
 */
export function MeHome() {
  const router = useRouter();
  const { entries, voiceMemories, isLoading, getStreak } = useJournal();
  const { profile } = useProfile();
  const [photoOpen, setPhotoOpen] = useState(false);

  const monthLabel = useMemo(() => MONTH_FORMATTER.format(new Date()), []);

  const monthEntryCount = useMemo(() => {
    const now = new Date();
    return entries.filter((entry) => {
      const created = new Date(entry.createdAt);
      return (
        created.getFullYear() === now.getFullYear() &&
        created.getMonth() === now.getMonth()
      );
    }).length;
  }, [entries]);

  const latestEntry = useMemo(
    () =>
      [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0],
    [entries]
  );

  const recentVoices = useMemo(
    () =>
      [...voiceMemories]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 4),
    [voiceMemories]
  );

  const lastUpdated = useMemo(() => {
    if (entries.length === 0) return null;
    return entries.reduce(
      (latest, entry) => (entry.updatedAt > latest ? entry.updatedAt : latest),
      entries[0].updatedAt
    );
  }, [entries]);

  const streak = getStreak();

  // ── Loading ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="px-5 pt-12">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="mt-6 h-9 w-56" />
        <Skeleton className="mt-3 h-4 w-64" />
        <Skeleton className="mt-8 h-44 w-full rounded-card" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-12">
      {/* Greeting — name, alongside the tappable photo */}
      <section className="mt-7 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-ink text-[26px] leading-tight font-medium">
            {timeGreeting()},
            <br />
            {profile.name}.
          </h2>
          <p className="text-ink-2 mt-2 text-sm">
            Your days are kept here, quietly.
          </p>
        </div>
        <Sprig seed={profile.name || 'ash-diary'} size={52} className="text-ok mt-1 shrink-0" />
      </section>

      {/* Personal photo — tap to view larger */}
      <button
        onClick={() => setPhotoOpen(true)}
        className="press mt-6 block w-full text-left"
        aria-label="View your photo larger"
      >
        <ImageFrame
          src={IMAGE_PATHS.profile}
          alt="A personal memory"
          tilt
        />
      </button>

      {photoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPhotoOpen(false)}
          className="animate-fade-in fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-8"
        >
          <button
            onClick={() => setPhotoOpen(false)}
            aria-label="Close"
            className="text-ink-2 absolute top-safe right-5 mt-4 flex h-11 w-11 items-center justify-center"
          >
            <IconX size={22} />
          </button>
          <img
            src={IMAGE_PATHS.profile}
            alt="A personal memory"
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}

      {/* Month overview */}
      <section className="mt-7">
        <p className="text-ember text-[11px] font-semibold tracking-[0.22em] uppercase">
          Your memories
        </p>
        <div className="mt-1.5 flex items-end justify-between">
          <h3 className="font-display text-ink text-[22px] font-medium">
            {monthLabel}
          </h3>
          <p className="text-ink-2 pb-0.5 text-sm">
            {monthEntryCount} {monthEntryCount === 1 ? 'entry' : 'entries'}
          </p>
        </div>

        {/* Streak + last updated */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-surface border-line rounded-card border p-4">
            <p className="text-ink-3 text-[10px] font-semibold tracking-[0.18em] uppercase">
              Streak
            </p>
            <p className="text-ink mt-1.5 flex items-center gap-2 text-base font-medium">
              <span className="bg-ember animate-pulse-soft h-1.5 w-1.5 rounded-full" />
              {streak > 0
                ? `${streak} ${streak === 1 ? 'day' : 'days'}`
                : 'Begin today'}
            </p>
          </div>
          <div className="bg-surface border-line rounded-card border p-4">
            <p className="text-ink-3 text-[10px] font-semibold tracking-[0.18em] uppercase">
              Last updated
            </p>
            <p className="text-ink mt-1.5 text-base font-medium">
              {lastUpdated ? getRelativeTime(lastUpdated) : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* Latest written memory */}
      {latestEntry ? (
        <section className="mt-8">
          <MemoryCard
            entry={latestEntry}
            onClick={() => router.push(`/journal/write?id=${latestEntry.id}`)}
          />
        </section>
      ) : (
        <section className="mt-4">
          <EmptyState
            icon={<IconBook size={24} />}
            title="Your journal is empty"
            description="Every memory starts with a single line. Write your first entry."
            actionLabel="Write your first entry"
            onAction={() => router.push('/journal/write')}
          />
        </section>
      )}

      {/* Recent voice memories — up to 4 */}
      {recentVoices.length > 0 && (
        <section className="mt-8">
          <h3 className="text-ink-3 px-1 text-[11px] font-semibold tracking-[0.22em] uppercase">
            Recent voice memories
          </h3>
          <div className="mt-3 space-y-2">
            {recentVoices.map((voice) => (
              <VoiceMemoryCard key={voice.id} memory={voice} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
