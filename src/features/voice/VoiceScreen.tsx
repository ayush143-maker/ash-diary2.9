'use client';

import React, { useMemo, useRef, useState } from 'react';
import type { VoiceMemory } from '@/types';
import { useJournal } from '@/context/JournalProvider';
import { VoiceMemoryCard } from '@/components/shared/VoiceMemoryCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Fab } from '@/components/shared/Fab';
import { IconMic } from '@/components/icons';
import { VoiceRecorderUI } from './VoiceRecorderUI';
import { SaveVoiceSheet } from './SaveVoiceSheet';

const SHORT_DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

/**
 * VOICE — the voice memories list, the record button, and the
 * record → save flow.
 */
export function VoiceScreen() {
  const { voiceMemories, isLoading, createVoiceMemory, deleteVoiceMemory } =
    useJournal();

  const [recorderOpen, setRecorderOpen] = useState(false);
  const [pendingDuration, setPendingDuration] = useState<number | null>(null);
  const [pendingAudioSrc, setPendingAudioSrc] = useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<VoiceMemory | null>(null);

  const pressTimer = useRef<number | null>(null);

  const sortedMemories = useMemo(
    () =>
      [...voiceMemories].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [voiceMemories]
  );

  const defaultTitle = `Voice memory · ${SHORT_DATE.format(new Date())}`;

  // Hold-to-delete (plus right-click on desktop).
  const startPress = (memory: VoiceMemory) => {
    pressTimer.current = window.setTimeout(() => setDeleteTarget(memory), 500);
  };
  const endPress = () => {
    if (pressTimer.current !== null) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleSaveVoice = (title: string) => {
    createVoiceMemory(title, pendingDuration ?? 0, pendingAudioSrc);
    setPendingDuration(null);
    setPendingAudioSrc(undefined);
  };

  return (
    <div>
      {/* List */}
      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-[88px] w-full rounded-card" />
          ))}
        </div>
      ) : sortedMemories.length === 0 ? (
        <EmptyState
          icon={<IconMic size={24} />}
          title="No voice memories yet"
          description="Some feelings are easier spoken. Record your first voice memory."
          actionLabel="Start recording"
          onAction={() => setRecorderOpen(true)}
        />
      ) : (
        <>
          <div className="mt-6 space-y-3 pb-24">
            {sortedMemories.map((memory) => (
              <div
                key={memory.id}
                onPointerDown={() => startPress(memory)}
                onPointerUp={endPress}
                onPointerLeave={endPress}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setDeleteTarget(memory);
                }}
              >
                <VoiceMemoryCard memory={memory} />
              </div>
            ))}
          </div>
          <p className="text-ink-3 pb-2 text-center text-[11px]">
            Hold a memory to delete it.
          </p>
        </>
      )}

      {/* Record button — small FAB, bottom-right above the nav */}
      {!isLoading && sortedMemories.length > 0 && (
        <Fab
          onClick={() => setRecorderOpen(true)}
          aria-label="Record a voice memory"
          icon={<IconMic size={22} />}
        />
      )}

      {/* Recorder */}
      {recorderOpen && (
        <VoiceRecorderUI
          onFinished={(duration, audioSrc) => {
            setRecorderOpen(false);
            setPendingDuration(duration);
            setPendingAudioSrc(audioSrc);
          }}
          onCancel={() => setRecorderOpen(false)}
        />
      )}

      {/* Save sheet */}
      <SaveVoiceSheet
        isOpen={pendingDuration !== null}
        durationSec={pendingDuration ?? 0}
        defaultTitle={defaultTitle}
        onClose={() => {
          setPendingDuration(null);
          setPendingAudioSrc(undefined);
        }}
        onSave={handleSaveVoice}
      />

      {/* Delete confirmation */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={deleteTarget ? `Delete “${deleteTarget.title}”?` : 'Delete?'}
        description="This voice memory will be gone from your device and detached from any entries."
        confirmLabel="Delete"
        cancelLabel="Keep it"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) deleteVoiceMemory(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
