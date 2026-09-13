'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Mood } from '@/types';
import { useJournal } from '@/context/JournalProvider';
import { useSettings } from '@/context/SettingsProvider';
import { useNow } from '@/hooks/useNow';
import { formatDate, formatTime, getRelativeTime } from '@/lib/dates';
import { countWords, formatDuration } from '@/lib/format';
import { cn } from '@/lib/cn';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import {
  IconCheck,
  IconMic,
  IconTrash,
} from '@/components/icons';
import { EditorToolbar, type EditorAction } from './EditorToolbar';
import { MoodSelector } from './MoodSelector';

type SaveStatus = 'idle' | 'saving' | 'saved';

interface JournalEditorProps {
  /** Omitted for /journal/new — the entry is created lazily on first save. */
  entryId?: string;
}

export function JournalEditor({ entryId }: JournalEditorProps) {
  const router = useRouter();
  const {
    entries,
    voiceMemories,
    isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
  } = useJournal();
  const { settings } = useSettings();
  useNow(30_000); // keeps "Saved …" relative time fresh

  const existingEntry = useMemo(
    () => (entryId ? entries.find((entry) => entry.id === entryId) : undefined),
    [entries, entryId]
  );

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  const [voiceIds, setVoiceIds] = useState<string[]>([]);
  const [resolvedId, setResolvedId] = useState<string | undefined>(entryId);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [voiceSheetOpen, setVoiceSheetOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialized = useRef(false);
  const skipFirstSave = useRef(true);

  const createdNow = useMemo(() => new Date().toISOString(), []);
  const createdAt = existingEntry?.createdAt ?? createdNow;

  // ── Initialise local draft from the store (once) ───────────────
  useEffect(() => {
    if (isLoading || initialized.current) return;
    if (existingEntry) {
      setTitle(existingEntry.title);
      setBody(existingEntry.body);
      setMood(existingEntry.mood);
      setVoiceIds(existingEntry.voiceMemoryIds);
      setSavedAt(existingEntry.updatedAt);
    } else if (!entryId) {
      setMood(settings.defaultMood);
    }
    initialized.current = true;
  }, [isLoading, existingEntry, entryId, settings.defaultMood]);

  // ── Save logic ─────────────────────────────────────────────────
  const performSave = useCallback(() => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle && !body.trim()) return;
    if (resolvedId) {
      updateEntry(resolvedId, {
        title: trimmedTitle,
        body,
        mood,
        voiceMemoryIds: voiceIds,
      });
    } else {
      const created = createEntry(trimmedTitle || 'Untitled');
      updateEntry(created.id, { body, mood, voiceMemoryIds: voiceIds });
      setResolvedId(created.id);
    }
    setSavedAt(new Date().toISOString());
    setSaveStatus('saved');
  }, [title, body, mood, voiceIds, resolvedId, updateEntry, createEntry]);

  const flushRef = useRef(performSave);
  flushRef.current = performSave;

  // Debounced autosave.
  useEffect(() => {
    if (isLoading || !initialized.current || !settings.autoSave) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    if (!title.trim() && !body.trim()) return;
    setSaveStatus('saving');
    const timer = setTimeout(() => flushRef.current(), 800);
    return () => clearTimeout(timer);
  }, [title, body, mood, voiceIds, isLoading, settings.autoSave]);

  // Flush on tab close / refresh so words are never lost.
  useEffect(() => {
    const onPageHide = () => flushRef.current();
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, []);

  // Flush on unmount too — covers switching tabs or using the native
  // back gesture, now that there's no in-app back button at all. The
  // 800ms debounce above already covers most cases; this just closes
  // the gap for the last keystroke before leaving.
  useEffect(() => {
    return () => {
      if (settings.autoSave) flushRef.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Formatting actions ─────────────────────────────────────────
  const applyAction = (action: EditorAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);
    let next = value;
    let cursorStart = start;
    let cursorEnd = end;
    switch (action) {
      case 'bold':
      case 'italic': {
        const marker = action === 'bold' ? '**' : '*';
        if (selected) {
          next = before + marker + selected + marker + after;
          cursorStart = start + marker.length;
          cursorEnd = end + marker.length;
        } else {
          next = before + marker + marker + after;
          cursorStart = cursorEnd = start + marker.length;
        }
        break;
      }
      case 'heading':
      case 'bullet':
      case 'quote': {
        const prefix =
          action === 'heading' ? '## ' : action === 'bullet' ? '- ' : '> ';
        const lineStart = before.lastIndexOf('\n') + 1;
        const linePrefix = value.slice(lineStart, start);
        if (linePrefix.startsWith(prefix)) {
          // Toggle off
          next = value.slice(0, lineStart) + value.slice(lineStart + prefix.length);
          cursorStart = Math.max(lineStart, start - prefix.length);
          cursorEnd = Math.max(lineStart, end - prefix.length);
        } else {
          next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
          cursorStart = start + prefix.length;
          cursorEnd = end + prefix.length;
        }
        break;
      }
      case 'divider': {
        const insert = '\n\n---\n\n';
        next = before + insert + after;
        cursorStart = cursorEnd = start + insert.length;
        break;
      }
    }
    setBody(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  // ── Auto-grow textarea ─────────────────────────────────────────
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [body, resizeTextarea]);

  const toggleVoice = (id: string) => {
    setVoiceIds((prev) =>
      prev.includes(id) ? prev.filter((voiceId) => voiceId !== id) : [...prev, id]
    );
  };

  // ── Edge states ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="px-5 pt-16">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="mt-4 h-9 w-2/3" />
        <Skeleton className="mt-6 h-64 w-full rounded-card" />
      </div>
    );
  }

  if (entryId && !existingEntry) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-ink text-2xl font-medium">
          This entry drifted away.
        </h1>
        <p className="text-ink-2 mt-2 text-sm">It may have been deleted.</p>
        <Button className="mt-6" onClick={() => router.replace('/journal')}>
          Back to journal
        </Button>
      </div>
    );
  }

  const indicator = !settings.autoSave
    ? 'Auto-save off'
    : saveStatus === 'saving'
      ? 'Saving…'
      : savedAt
        ? `Saved ${getRelativeTime(savedAt)}`
        : '';

  const wordCount = countWords(body);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Top bar — NO in-app back button: the phone's own navigation
          (gesture / hardware back) leaves the editor, and the unmount
          flush above guarantees the last keystroke is saved first.
          The save indicator now sits on the LEFT, aligned to the same
          px-5 grid as the title; delete stays on the right. */}
      <header className="flex items-center justify-between px-5 pt-3">
        <p
          aria-live="polite"
          className={cn(
            'tnum flex h-11 items-center text-xs',
            saveStatus === 'saving'
              ? 'text-ink-2 animate-pulse-soft'
              : 'text-ink-3'
          )}
        >
          {indicator}
        </p>
        {resolvedId && existingEntry ? (
          <button
            onClick={() => setDeleteModalOpen(true)}
            aria-label="Delete entry"
            className="press text-ink-3 hover:bg-danger-wash hover:text-danger flex h-11 w-11 items-center justify-center rounded-full transition-colors"
          >
            <IconTrash size={18} />
          </button>
        ) : (
          <span aria-hidden="true" className="h-11 w-11" />
        )}
      </header>

      {/* Writing surface — scrolls under the fixed footer below */}
      <div className="flex-1 px-5 pb-24">
        <time className="text-ink-3 block text-[11px] font-semibold tracking-[0.18em] uppercase">
          {formatDate(createdAt)}
          {settings.showTimestamps && ` · ${formatTime(createdAt)}`}
        </time>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              textareaRef.current?.focus();
            }
          }}
          placeholder="Title"
          aria-label="Entry title"
          className="font-display text-ink placeholder:text-ink-3 mt-2 w-full bg-transparent text-[26px] font-medium tracking-tight outline-none"
        />
        <EditorToolbar onAction={applyAction} />
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Let the day settle onto the page…"
          aria-label="Entry body"
          className="font-display text-ink placeholder:text-ink-3 mt-4 min-h-[45vh] w-full resize-none bg-transparent text-[17px] leading-[1.8] outline-none"
        />
      </div>

      {/* Footer — fixed to the viewport, not document flow, so it never
          drifts with textarea length or scroll position. */}
      <footer className="border-line bg-surface fixed inset-x-0 bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 border-t px-5 py-3 pb-safe">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <MoodSelector value={mood} onChange={setMood} />
            <button
              onClick={() => setVoiceSheetOpen(true)}
              className="press text-ink-2 hover:text-ink border-line bg-surface-2 inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors"
            >
              <IconMic
                size={15}
                className={voiceIds.length > 0 ? 'text-ember' : undefined}
              />
              {voiceIds.length > 0
                ? `Voice · ${voiceIds.length}`
                : 'Attach voice'}
            </button>
          </div>
          <span className="tnum text-ink-3 shrink-0 text-xs">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
      </footer>

      {/* Attach voice sheet */}
      <BottomSheet
        isOpen={voiceSheetOpen}
        onClose={() => setVoiceSheetOpen(false)}
        title="Attach a voice memory"
      >
        {voiceMemories.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-display text-ink text-lg font-medium">
              No voice memories yet
            </p>
            <p className="text-ink-2 mt-1.5 text-sm leading-relaxed">
              Record one from the Voice tab, then attach it here.
            </p>
          </div>
        ) : (
          <div className="space-y-1 pb-4">
            {voiceMemories.map((memory) => {
              const attached = voiceIds.includes(memory.id);
              return (
                <button
                  key={memory.id}
                  onClick={() => toggleVoice(memory.id)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-control px-4 py-3.5 text-left transition-colors',
                    attached ? 'bg-ember-wash' : 'hover:bg-surface-2'
                  )}
                >
                  <span className="min-w-0">
                    <span
                      className={cn(
                        'block truncate text-[15px] font-medium',
                        attached ? 'text-ember' : 'text-ink'
                      )}
                    >
                      {memory.title}
                    </span>
                    <span className="tnum text-ink-3 mt-0.5 block text-xs">
                      {formatDuration(memory.durationSec)} ·{' '}
                      {formatDate(memory.createdAt)}
                    </span>
                  </span>
                  {attached && (
                    <IconCheck size={18} className="text-ember shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </BottomSheet>

      {/* Delete confirmation */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete this entry?"
        description="This memory will be gone from your device. This can't be undone."
        confirmLabel="Delete"
        cancelLabel="Keep it"
        variant="danger"
        onConfirm={() => {
          if (resolvedId) deleteEntry(resolvedId);
          setDeleteModalOpen(false);
          router.replace('/journal');
        }}
      />
    </div>
  );
}
