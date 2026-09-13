'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';

interface PermissionSheetProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

/**
 * The calm pre-prompt sheet shown before any OS permission dialog.
 *
 * DOUBLE-TAP FIX (issue #4): previously every tap fired onConfirm, so two
 * taps inside one render window (before React re-rendered the disabled
 * state) could request the OS permission twice. The guard below is a
 * REF, not state — refs update synchronously, so the second tap in the
 * same frame is a no-op. While the request is pending the confirm button
 * is disabled and shows a quiet "One moment…" label. The guard resets
 * each time the sheet opens.
 *
 * Props are unchanged, so VoiceRecorderUI and RemindersSection need no edits.
 */
export function PermissionSheet({
  isOpen,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: PermissionSheetProps) {
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  // Fresh sheet = fresh guard.
  useEffect(() => {
    if (isOpen) {
      busyRef.current = false;
      setBusy(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (busyRef.current) return; // synchronous guard — second tap dies here
    busyRef.current = true;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="pb-4">
        <p className="text-ink-2 text-sm leading-relaxed">{description}</p>
        <div className="mt-5 flex flex-col gap-2">
          <Button size="lg" onClick={handleConfirm} disabled={busy}>
            {busy ? 'One moment…' : confirmLabel}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Not now
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
