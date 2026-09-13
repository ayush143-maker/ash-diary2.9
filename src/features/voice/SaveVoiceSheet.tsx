'use client';

import React, { useEffect, useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Waveform } from '@/components/shared/Waveform';
import { formatDuration } from '@/lib/format';

interface SaveVoiceSheetProps {
  isOpen: boolean;
  durationSec: number;
  /** Used as placeholder and fallback title when saved without a name. */
  defaultTitle: string;
  /** Discards the recording. */
  onClose: () => void;
  onSave: (title: string) => void;
}

export function SaveVoiceSheet({
  isOpen,
  durationSec,
  defaultTitle,
  onClose,
  onSave,
}: SaveVoiceSheetProps) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (isOpen) setTitle('');
  }, [isOpen]);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Save this memory">
      <div className="pb-4">
        {/* Duration recap */}
        <div className="bg-surface-2 border-line rounded-card flex items-center gap-4 border p-4">
          <Waveform
            seed={`${defaultTitle}-${durationSec}`}
            barCount={28}
            className="h-8 flex-1"
          />
          <span className="tnum text-ink-2 text-sm font-medium">
            {formatDuration(durationSec)}
          </span>
        </div>

        <div className="mt-4">
          <Input
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={defaultTitle}
            autoFocus
            enterKeyHint="done"
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSave(title.trim() || defaultTitle);
            }}
          />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={() => onSave(title.trim() || defaultTitle)}>
            Save memory
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Discard
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
