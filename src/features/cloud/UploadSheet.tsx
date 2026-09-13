'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { CloudBackup, JournalEntry, VoiceMemory } from '@/types';
import { useJournal } from '@/context/JournalProvider';
import { getCloudProvider } from '@/services/cloud';
import type { UploadProgress } from '@/services/cloud/types';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { formatDate } from '@/lib/dates';
import { countWords, formatBytes, formatDuration } from '@/lib/format';
import { cn } from '@/lib/cn';
import { IconCheck, IconUpload, IconX } from '@/components/icons';

type UploadPhase = 'select' | 'uploading' | 'success' | 'error';

interface UploadSheetProps {
  isOpen: boolean;
  onClose: () => void;
  backup: CloudBackup;
  onComplete: (summary: {
    entryIds: string[];
    voiceIds: string[];
    bytes: number;
  }) => void;
}

/** Simulated payload sizes — replaced by real file sizes in Phase 2. */
function estimateEntryBytes(entry: JournalEntry): number {
  return (entry.title.length + entry.body.length) * 2 + 512;
}
function estimateVoiceBytes(voice: VoiceMemory): number {
  return Math.round(voice.durationSec * 16_000);
}

/**
 * Explicit, item-by-item upload. Nothing is backed up automatically —
 * the user chooses exactly what leaves the device.
 */
export function UploadSheet({ isOpen, onClose, backup, onComplete }: UploadSheetProps) {
  const { entries, voiceMemories } = useJournal();

  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [selectedVoices, setSelectedVoices] = useState<string[]>([]);
  const [phase, setPhase] = useState<UploadPhase>('select');
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fresh state every time the sheet opens.
  useEffect(() => {
    if (isOpen) {
      setSelectedEntries([]);
      setSelectedVoices([]);
      setPhase('select');
      setProgress([]);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const titleById = useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach((entry) => map.set(entry.id, entry.title || 'Untitled'));
    voiceMemories.forEach((voice) => map.set(voice.id, voice.title));
    return map;
  }, [entries, voiceMemories]);

  const totalSelected = selectedEntries.length + selectedVoices.length;
  const overallProgress =
    progress.length > 0
      ? Math.round(
          progress.reduce((sum, item) => sum + item.progress, 0) / progress.length
        )
      : 0;

  const toggleEntry = (id: string) => {
    setSelectedEntries((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };
  const toggleVoice = (id: string) => {
    setSelectedVoices((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const startUpload = async () => {
    setPhase('uploading');
    setErrorMessage(null);
    const provider = getCloudProvider();
    const entryObjs = entries.filter((e) => selectedEntries.includes(e.id));
    const voiceObjs = voiceMemories.filter((v) => selectedVoices.includes(v.id));
    const result = await provider.uploadItems(entryObjs, voiceObjs, setProgress);
    if (result.success) {
      setPhase('success');
    } else {
      setPhase('error');
      setErrorMessage(result.error ?? 'Something went wrong.');
    }
  };

  const handleDone = () => {
    const bytes =
      selectedEntries.reduce((sum, id) => {
        const entry = entries.find((item) => item.id === id);
        return sum + (entry ? estimateEntryBytes(entry) : 0);
      }, 0) +
      selectedVoices.reduce((sum, id) => {
        const voice = voiceMemories.find((item) => item.id === id);
        return sum + (voice ? estimateVoiceBytes(voice) : 0);
      }, 0);

    onComplete({ entryIds: selectedEntries, voiceIds: selectedVoices, bytes });
  };

  const requestClose = () => {
    if (phase === 'uploading') return; // protect an in-flight backup
    onClose();
  };

  const sheetTitle =
    phase === 'select'
      ? 'Upload to Cloud'
      : phase === 'uploading'
        ? 'Backing up…'
        : 'Cloud Backup';

  const hasAnything = entries.length > 0 || voiceMemories.length > 0;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={requestClose}
      title={sheetTitle}
      footer={
        phase === 'select' && hasAnything ? (
          <div>
            <p className="text-ink-3 mb-3 px-1 text-xs">
              Only what you select leaves this device.
            </p>
            <Button
              icon={<IconUpload size={16} />}
              disabled={totalSelected === 0}
              onClick={startUpload}
              className="w-full"
            >
              Upload {totalSelected} {totalSelected === 1 ? 'item' : 'items'}
            </Button>
          </div>
        ) : undefined
      }
    >
      {/* ── SELECT ─────────────────────────────────────────────── */}
      {phase === 'select' && (
        <div className="pb-2">
          {!hasAnything ? (
            <div className="py-10 text-center">
              <p className="font-display text-ink text-lg font-medium">
                Nothing to back up yet
              </p>
              <p className="text-ink-2 mt-1.5 text-sm">
                Write or record a memory first, then choose it here.
              </p>
            </div>
          ) : (
            <>
              {entries.length > 0 && (
                <>
                  <p className="text-ink-3 px-1 pb-1 text-[11px] font-semibold tracking-[0.18em] uppercase">
                    Journal entries
                  </p>
                  <div className="space-y-1">
                    {entries.map((entry) => (
                      <SelectionRow
                        key={entry.id}
                        title={entry.title || 'Untitled'}
                        meta={`${formatDate(entry.createdAt)} · ${countWords(entry.body)} words${
                          backup.uploadedEntryIds.includes(entry.id)
                            ? ' · Backed up'
                            : ''
                        }`}
                        selected={selectedEntries.includes(entry.id)}
                        onToggle={() => toggleEntry(entry.id)}
                      />
                    ))}
                  </div>
                </>
              )}

              {voiceMemories.length > 0 && (
                <>
                  <p className="text-ink-3 mt-4 px-1 pb-1 text-[11px] font-semibold tracking-[0.18em] uppercase">
                    Voice memories
                  </p>
                  <div className="space-y-1">
                    {voiceMemories.map((voice) => (
                      <SelectionRow
                        key={voice.id}
                        title={voice.title}
                        meta={`${formatDate(voice.createdAt)} · ${formatDuration(voice.durationSec)}${
                          backup.uploadedVoiceIds.includes(voice.id)
                            ? ' · Backed up'
                            : ''
                        }`}
                        selected={selectedVoices.includes(voice.id)}
                        onToggle={() => toggleVoice(voice.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── UPLOADING ──────────────────────────────────────────── */}
      {phase === 'uploading' && (
        <div className="pb-6">
          <Progress value={overallProgress} />
          <p className="tnum text-ink-3 mt-2 text-xs">
            {overallProgress}% · backing up {totalSelected}{' '}
            {totalSelected === 1 ? 'item' : 'items'}
          </p>
          <div className="mt-4 space-y-1">
            {progress.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5"
              >
                <span className="text-ink truncate text-sm">
                  {titleById.get(item.id) ?? 'Memory'}
                </span>
                <span className="tnum shrink-0 text-xs">
                  {item.status === 'success' && (
                    <IconCheck size={16} className="text-ok" />
                  )}
                  {item.status === 'error' && (
                    <IconX size={16} className="text-danger" />
                  )}
                  {(item.status === 'pending' || item.status === 'uploading') && (
                    <span className="text-ink-3">{item.progress}%</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUCCESS ────────────────────────────────────────────── */}
      {phase === 'success' && (
        <div className="py-8 text-center">
          <span className="bg-ok-wash text-ok mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <IconCheck size={28} />
          </span>
          <h4 className="font-display text-ink mt-4 text-xl font-medium">
            Backed up
          </h4>
          <p className="text-ink-2 mt-1.5 text-sm">
            {totalSelected} {totalSelected === 1 ? 'memory is' : 'memories are'}{' '}
            safe in your cloud backup.
          </p>
          <Button className="mt-6 w-full" onClick={handleDone}>
            Done
          </Button>
        </div>
      )}

      {/* ── ERROR ──────────────────────────────────────────────── */}
      {phase === 'error' && (
        <div className="py-8 text-center">
          <span className="bg-danger-wash text-danger mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <IconX size={28} />
          </span>
          <h4 className="font-display text-ink mt-4 text-xl font-medium">
            Upload failed
          </h4>
          <p className="text-ink-2 mt-1.5 px-4 text-sm leading-relaxed">
            {errorMessage} Your memories never left your device.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={startUpload}>
              Retry
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

function SelectionRow({
  title,
  meta,
  selected,
  onToggle,
}: {
  title: string;
  meta: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-control px-4 py-3 text-left transition-colors',
        selected ? 'bg-ember-wash' : 'hover:bg-surface-2'
      )}
    >
      <span className="min-w-0">
        <span
          className={cn(
            'block truncate text-[15px] font-medium',
            selected ? 'text-ember' : 'text-ink'
          )}
        >
          {title}
        </span>
        <span className="text-ink-3 mt-0.5 block text-xs">{meta}</span>
      </span>
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
          selected
            ? 'bg-ember border-ember text-on-ember'
            : 'border-line-2 text-transparent'
        )}
      >
        <IconCheck size={14} />
      </span>
    </button>
  );
}
