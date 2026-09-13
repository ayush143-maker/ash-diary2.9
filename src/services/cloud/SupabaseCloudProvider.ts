import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import type { JournalEntry, VoiceMemory } from '@/types';
import { getSupabaseClient, ensureAnonymousSession } from '@/lib/supabase/client';
import type { CloudProvider, UploadProgress } from './types';

const VOICE_BUCKET = 'voice-memories';

/** Fallback base64 decode step size — keeps intermediates small (32 KiB chars, multiple of 4). */
const DECODE_STEP = 32 * 1024 - (32 * 1024 % 4);

/** Upload retry policy for flaky mobile networks (upsert makes retries safe). */
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [1000, 2000, 4000];

/** Regex-free extension parse: strip query/hash, take suffix after last dot. */
function extensionFor(uri: string): string {
  const clean = uri.split('?')[0].split('#')[0];
  const dot = clean.lastIndexOf('.');
  if (dot === -1 || dot === clean.length - 1) return 'm4a';
  const ext = clean.slice(dot + 1).toLowerCase();
  return /^[a-z0-9]{2,4}$/.test(ext) ? ext : 'm4a';
}

/**
 * Chunked base64 → bytes. Decodes 32 KiB char slices at a time so no
 * single giant intermediate string or multi-million-iteration loop ever
 * blocks the JS thread (the old per-byte loop froze the WebView on
 * longer recordings).
 */
function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let total = 0;
  for (let i = 0; i < base64.length; i += DECODE_STEP) {
    const bin = atob(base64.slice(i, i + DECODE_STEP));
    const bytes = new Uint8Array(bin.length);
    for (let j = 0; j < bin.length; j++) bytes[j] = bin.charCodeAt(j);
    chunks.push(bytes);
    total += bin.length;
  }
  const out = new Uint8Array(total) as Uint8Array<ArrayBuffer>;
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/**
 * Reads a local recording into a Blob WITHOUT materialising base64 in JS
 * memory: on native the file:// URI is bridged through
 * Capacitor.convertFileSrc and streamed via fetch (the same path the
 * <audio> element uses for playback); on web the blob: URL fetches
 * natively. Only if streaming is unavailable do we fall back to a bridge
 * read + chunked decode.
 */
async function readAudioBlob(uri: string): Promise<Blob | null> {
  try {
    const src = Capacitor.isNativePlatform() ? Capacitor.convertFileSrc(uri) : uri;
    const res = await fetch(src);
    if (res.ok) return await res.blob();
    console.error('Streaming read returned', res.status);
  } catch (err) {
    console.error('Streaming read failed, falling back to base64 decode:', err);
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const { data } = await Filesystem.readFile({ path: uri });
      const bytes = base64ToBytes(data as string);
      return new Blob([bytes], { type: 'audio/m4a' });
    } catch (err) {
      console.error('Failed to read local audio file for upload:', err);
      return null;
    }
  }
  return null;
}

type SupabaseClient = NonNullable<ReturnType<typeof getSupabaseClient>>;

/**
 * Single-object upload with exponential-backoff retry. supabase-js has no
 * resumable/chunked browser upload, so resilience comes from: streaming
 * read (no memory ceiling), idempotent upsert (retry-safe), and bounded
 * retries (survives transient mobile-network drops). Returns an error
 * message, or null on success.
 */
async function uploadWithRetry(
  supabase: SupabaseClient,
  path: string,
  blob: Blob
): Promise<string | null> {
  let lastError = 'Upload failed.';
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const { error } = await supabase.storage.from(VOICE_BUCKET).upload(path, blob, {
      upsert: true,
      contentType: blob.type || 'audio/m4a',
    });
    if (!error) return null;
    lastError = error.message;
    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, BACKOFF_MS[attempt]));
    }
  }
  return lastError;
}

/**
 * Real Supabase backend: Postgres for entries/voice metadata, Storage for
 * audio bytes, anonymous auth for the user_id every row is scoped to
 * under RLS. Offline-first is preserved one level up (in CloudScreen) —
 * this provider only runs when the user explicitly taps "Upload to
 * Cloud"; local storage remains the source of truth regardless of
 * whether this succeeds.
 *
 * LARGE-UPLOAD FIX (issue #2): see readAudioBlob (streaming, memory-safe)
 * and uploadWithRetry (backoff). A voice item is only marked success when
 * its audio bytes actually landed — a failed read now reports an error
 * instead of silently uploading a row with audio_url = null.
 */
export class SupabaseCloudProvider implements CloudProvider {
  async uploadItems(
    entries: JournalEntry[],
    voiceMemories: VoiceMemory[],
    onProgress: (progress: UploadProgress[]) => void
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Cloud backup isn’t configured on this build.' };
    }

    const userId = await ensureAnonymousSession();
    if (!userId) {
      return {
        success: false,
        error: 'Couldn’t reach the cloud — check your connection and try again.',
      };
    }

    const progressState: UploadProgress[] = [
      ...entries.map((e) => ({ id: e.id, status: 'pending' as const, progress: 0 })),
      ...voiceMemories.map((v) => ({ id: v.id, status: 'pending' as const, progress: 0 })),
    ];
    onProgress(progressState);

    let totalBytes = 0;
    let firstError: string | undefined;

    const setItem = (id: string, patch: Partial<UploadProgress>) => {
      const idx = progressState.findIndex((p) => p.id === id);
      if (idx !== -1) progressState[idx] = { ...progressState[idx], ...patch };
      onProgress([...progressState]);
    };

    // ── Written entries: small rows, straight upsert ────────────────
    for (const entry of entries) {
      setItem(entry.id, { status: 'uploading', progress: 30 });
      const { error } = await supabase.from('journal_entries').upsert(
        {
          id: entry.id,
          user_id: userId,
          title: entry.title,
          body: entry.body,
          mood: entry.mood ?? null,
          voice_memory_ids: entry.voiceMemoryIds,
          created_at: entry.createdAt,
          updated_at: entry.updatedAt,
        },
        { onConflict: 'id' }
      );
      if (error) {
        setItem(entry.id, { status: 'error', progress: 0, error: error.message });
        firstError = firstError ?? error.message;
        continue;
      }
      totalBytes += (entry.title.length + entry.body.length) * 2 + 512;
      setItem(entry.id, { status: 'success', progress: 100 });
    }

    // ── Voice memories: stream read → retried upload → row ──────────
    for (const voice of voiceMemories) {
      setItem(voice.id, { status: 'uploading', progress: 20 });
      let audioUrl: string | null = null;

      if (voice.audioSrc) {
        const blob = await readAudioBlob(voice.audioSrc);
        if (!blob) {
          // Never claim success with missing audio (old silent-data-loss bug).
          setItem(voice.id, {
            status: 'error',
            progress: 0,
            error: 'Could not read the recording from this device.',
          });
          firstError = firstError ?? 'Could not read a local recording for upload.';
          continue;
        }
        setItem(voice.id, { progress: 40 });

        const path = `${userId}/${voice.id}.${extensionFor(voice.audioSrc)}`;
        const uploadError = await uploadWithRetry(supabase, path, blob);
        if (uploadError) {
          setItem(voice.id, { status: 'error', progress: 0, error: uploadError });
          firstError = firstError ?? uploadError;
          continue;
        }
        audioUrl = path;
        totalBytes += blob.size;
        setItem(voice.id, { progress: 70 });
      }

      const { error: rowError } = await supabase.from('voice_memories').upsert(
        {
          id: voice.id,
          user_id: userId,
          title: voice.title,
          duration_sec: voice.durationSec,
          audio_url: audioUrl,
          created_at: voice.createdAt,
        },
        { onConflict: 'id' }
      );
      if (rowError) {
        setItem(voice.id, { status: 'error', progress: 0, error: rowError.message });
        firstError = firstError ?? rowError.message;
        continue;
      }
      setItem(voice.id, { status: 'success', progress: 100 });
    }

    await supabase.from('backup_metadata').upsert(
      {
        user_id: userId,
        sync_status: firstError ? 'error' : 'synced',
        used_bytes: totalBytes,
        last_backup_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (firstError) {
      return { success: false, error: firstError };
    }
    return { success: true };
  }

  async getStorageUsed(): Promise<number> {
    const supabase = getSupabaseClient();
    if (!supabase) return 0;
    const userId = await ensureAnonymousSession();
    if (!userId) return 0;
    const { data, error } = await supabase
      .from('backup_metadata')
      .select('used_bytes')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return 0;
    return data.used_bytes ?? 0;
  }
}
