'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRecorder } from '@/hooks/useRecorder';
import { useToast } from '@/context/ToastProvider';
import { formatDuration } from '@/lib/format';
import { Waveform } from '@/components/shared/Waveform';
import { PermissionSheet } from '@/components/shared/PermissionSheet';
import { Button } from '@/components/ui/Button';
import { IconCheck, IconMic, IconX } from '@/components/icons';
import { cn } from '@/lib/cn';

interface VoiceRecorderUIProps {
  /** Called with the final duration and the saved local file URI (if capture succeeded). */
  onFinished: (durationSec: number, audioSrc?: string) => void;
  onCancel: () => void;
}

/**
 * The recording screen. Real microphone capture via useRecorder, gated
 * behind a calm pre-prompt sheet so the native mic dialog never appears
 * without context. Denial degrades gracefully to an inline message.
 *
 * Finish controls (Cancel / Save) are slim floating pills pinned to the
 * right side, sitting just above the bottom-navigation zone so they are
 * always visible and never glued to the nav bar.
 */
export function VoiceRecorderUI({ onFinished, onCancel }: VoiceRecorderUIProps) {
  const { status, durationSec, waveform, requestPermission, start, pause, resume, stop, cancel } =
    useRecorder();
  const { showToast } = useToast();
  const [prePromptOpen, setPrePromptOpen] = useState(true);
  const [denied, setDenied] = useState(false);

  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const beginCapture = async () => {
    setPrePromptOpen(false);
    const granted = await requestPermission();
    if (!granted) {
      setDenied(true);
      return;
    }
    const ok = await start();
    if (!ok) showToast('The recorder could not start — tap the mic to try again.', 'info');
  };

  useEffect(() => {
    return () => {
      if (statusRef.current !== 'idle') cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePause = () => {
    if (status === 'recording') {
      pause();
    } else if (status === 'paused') {
      resume();
    } else {
      start().then((ok) => {
        if (!ok) showToast('The recorder could not start — try once more.', 'info');
      });
    }
  };

  const handleSave = async () => {
    if (durationSec < 1) {
      showToast('Hold it a moment longer — a memory needs at least a second.', 'info');
      return;
    }
    const finalDuration = durationSec;
    const audioSrc = await stop();
    onFinished(finalDuration, audioSrc);
  };

  const handleCancelAudio = () => {
    cancel();
    onCancel();
  };

  if (denied) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="bg-canvas animate-fade-in fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center"
      >
        <p className="text-ink text-lg font-medium">Microphone access is off</p>
        <p className="text-ink-2 mt-2 text-sm leading-relaxed">
          Enable microphone access for ASH DIARY in your device settings to record voice memories.
        </p>
        <Button className="mt-6" onClick={onCancel}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recording a voice memory"
      className="bg-canvas animate-fade-in fixed inset-0 z-50 flex flex-col"
    >
      <PermissionSheet
        isOpen={prePromptOpen}
        title="Record a voice memory"
        description="ASH DIARY needs microphone access to record this memory. It's only ever used when you tap record, and the audio stays on your device unless you back it up."
        confirmLabel="Allow microphone"
        onConfirm={beginCapture}
        onClose={onCancel}
      />

      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pt-safe">
        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between pt-3">
          <button
            onClick={handleCancelAudio}
            className="press text-ink-2 hover:text-ink -ml-2 flex h-11 items-center gap-1.5 rounded-full px-2 text-sm font-medium transition-colors"
          >
            <IconX size={18} />
            Cancel
          </button>
          <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                status === 'recording' ? 'bg-danger animate-pulse-soft' : 'bg-ink-3'
              )}
            />
            <span className="text-ink-2">
              {status === 'recording' ? 'Recording' : 'Paused'}
            </span>
          </span>
        </div>

        {/* Center — timer, waveform, mic */}
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto py-6 pb-36">
          <p className="tnum text-ink text-5xl font-light">{formatDuration(durationSec)}</p>

          <Waveform values={waveform} animated={status === 'recording'} barCount={40} className="mt-6 h-16" />

          <button
            onClick={togglePause}
            aria-label={status === 'recording' ? 'Pause recording' : 'Resume recording'}
            className={cn(
              'mt-8 flex h-20 w-20 items-center justify-center rounded-full transition-colors',
              status === 'recording'
                ? 'bg-ember text-on-ember animate-breathe'
                : 'bg-surface-2 border-line text-ink border'
            )}
          >
            <IconMic size={30} />
          </button>
          <p className="text-ink-3 mt-3 text-xs">
            {status === 'recording' ? 'Tap to pause' : 'Tap to resume'}
          </p>
        </div>
      </div>

      {/* Finish controls — slim pills stacked on the right, floating with
          clear air above the bottom-nav zone (never glued to it). */}
      <div
        className="fixed right-5 z-20 flex flex-col items-end gap-2.5"
        style={{ bottom: 'calc(52px + env(safe-area-inset-bottom, 0px) + 26px)' }}
      >
        <button
          onClick={handleCancelAudio}
          aria-label="Cancel recording"
          className="press border-line bg-surface/90 text-ink-2 flex h-10 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium shadow-sm backdrop-blur transition-colors hover:text-ink"
        >
          <IconX size={14} />
          Cancel
        </button>
        <button
          onClick={handleSave}
          aria-label="Save recording"
          className="press bg-ember text-on-ember flex h-10 items-center gap-1.5 rounded-full px-5 text-[13px] font-semibold shadow-sm transition-opacity active:opacity-90"
        >
          <IconCheck size={14} />
          Save
        </button>
      </div>
    </div>
  );
}
