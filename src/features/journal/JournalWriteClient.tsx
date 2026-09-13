'use client';

import { useSearchParams } from 'next/navigation';
import { JournalEditor } from './JournalEditor';

/**
 * Reads the optional ?id= query param and hands it to JournalEditor,
 * which is otherwise unchanged from Phase 1. No id -> new entry.
 */
export function JournalWriteClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? undefined;

  return <JournalEditor entryId={id} />;
}
