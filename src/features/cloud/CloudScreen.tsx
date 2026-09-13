'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/context/SettingsProvider';
import { useJournal } from '@/context/JournalProvider';
import { useToast } from '@/context/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { IconUpload, IconSliders, IconChevronRight } from '@/components/icons';
import { useCloudBackup } from './useCloudBackup';
import { CloudBackupCard } from './CloudBackupCard';
import { UploadSheet } from './UploadSheet';
import { isCloudConfigured } from '@/services/cloud';
import { PrivacySection } from '@/features/general/PrivacySection';
import { RemindersSection } from '@/features/general/RemindersSection';

/**
 * CLOUD — optional, explicit backup.
 * The app makes one promise: nothing leaves the device unless the user
 * chooses it, item by item.
 */
export function CloudScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const { entries, voiceMemories } = useJournal();
  const { backup, isLoading, setBackup } = useCloudBackup();
  const { showToast } = useToast();

  const [uploadOpen, setUploadOpen] = useState(false);

  const totalMemories = entries.length + voiceMemories.length;

  const handleUploadComplete = (summary: {
    entryIds: string[];
    voiceIds: string[];
    bytes: number;
  }) => {
    setBackup({
      ...backup,
      enabled: true,
      provider: isCloudConfigured() ? 'supabase' : 'local-sim',
      lastBackupAt: new Date().toISOString(),
      usedBytes: backup.usedBytes + summary.bytes,
      uploadedEntryIds: [
        ...new Set([...backup.uploadedEntryIds, ...summary.entryIds]),
      ],
      uploadedVoiceIds: [
        ...new Set([...backup.uploadedVoiceIds, ...summary.voiceIds]),
      ],
    });
    setUploadOpen(false);
    showToast('Backup complete — your selected memories are safe.', 'success');
  };

  if (isLoading) {
    return (
      <div className="mt-6 space-y-4">
        <Skeleton className="h-32 w-full rounded-card" />
        <Skeleton className="h-12 w-full rounded-control" />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <CloudBackupCard backup={backup} />

      <Button
        icon={<IconUpload size={16} />}
        size="lg"
        className="mt-6 w-full"
        disabled={settings.localOnlyMode || totalMemories === 0}
        onClick={() => setUploadOpen(true)}
      >
        Upload to Cloud
      </Button>

      {settings.localOnlyMode && (
        <div className="bg-ember-wash rounded-card mt-4 px-5 py-4">
          <p className="text-ink-2 text-sm leading-relaxed">
            Local-only mode is on.{' '}
            <button
              onClick={() => router.push('/general')}
              className="text-ember font-medium underline underline-offset-2"
            >
              Turn it off in General
            </button>{' '}
            to back memories up.
          </p>
        </div>
      )}

      {!settings.localOnlyMode && totalMemories === 0 && (
        <p className="text-ink-3 mt-4 px-1 text-xs">
          Nothing to back up yet — write or record a memory first.
        </p>
      )}

      {/* What stays where — roomy two-column explainer */}
      <section className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-surface border-line rounded-card border p-5">
          <p className="text-ink-3 text-[10px] font-semibold tracking-[0.18em] uppercase">
            On device
          </p>
          <p className="text-ink mt-2 text-sm leading-relaxed">
            Entries, recordings, images, settings
          </p>
        </div>
        <div className="bg-surface border-line rounded-card border p-5">
          <p className="text-ink-3 text-[10px] font-semibold tracking-[0.18em] uppercase">
            In cloud
          </p>
          <p className="text-ink mt-2 text-sm leading-relaxed">
            Only selected backups and light metadata
          </p>
        </div>
      </section>

      {/* Entry point to General — folded in here since it's no longer its own tab */}
      <button
        onClick={() => router.push('/general')}
        className="bg-surface border-line hover:bg-surface-2 active:bg-surface-3 mt-10 flex min-h-[64px] w-full items-center justify-between rounded-card border px-5 py-4 text-left transition-colors"
      >
        <span className="flex items-center gap-3">
          <IconSliders size={18} className="text-ink-3" />
          <span className="text-ink text-[15px]">General</span>
        </span>
        <IconChevronRight size={16} className="text-ink-3" />
      </button>

      {/* Sections carry their own generous top margin — no extra stacking */}
      <div className="mt-2 pb-4">
        <RemindersSection />
        <PrivacySection />
      </div>

      <UploadSheet
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        backup={backup}
        onComplete={handleUploadComplete}
      />
    </div>
  );
}
