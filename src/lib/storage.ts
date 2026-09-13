import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

/**
 * Key-value persistence adapter.
 *
 * WHY NOT localStorage EVERYWHERE (issue #1): the WebView's localStorage
 * is quota-limited (~5–10MB) and is wiped whenever Android clears WebView
 * data — a diary must not live there. On native we therefore store each
 * key as its own UTF-8 JSON file inside the app's Data directory via
 * @capacitor/filesystem (already a dependency — no new plugin, no CI
 * change). Files have no practical quota, so the QuotaExceededError
 * class of failure simply no longer exists on-device.
 *
 * MIGRATION: installs that already have data in WebView localStorage are
 * migrated lazily — the first native read of a missing key falls back to
 * localStorage and, if found, copies the value into its file. Nothing is
 * lost when upgrading.
 *
 * Public API is unchanged (get / set / remove, all async), so no caller
 * needed to be touched.
 */

const KV_DIR = 'kv';

let dirReady: Promise<void> | null = null;
function ensureKvDir(): Promise<void> {
  if (!dirReady) {
    dirReady = Filesystem.mkdir({ path: KV_DIR, directory: Directory.Data, recursive: true })
      .then(() => undefined)
      .catch(() => undefined); // already exists — fine
  }
  return dirReady;
}

/** Filesystem paths only allow simple names; our keys are already simple, but be safe. */
function fileName(key: string): string {
  return `${KV_DIR}/${key.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
}

function readWeb<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    if (Capacitor.isNativePlatform()) {
      try {
        await ensureKvDir();
        const { data } = await Filesystem.readFile({
          path: fileName(key),
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });
        if (typeof data !== 'string' || data.length === 0) return null;
        return JSON.parse(data) as T;
      } catch {
        // Missing file → maybe a pre-migration value still sits in localStorage.
        const legacy = readWeb<T>(key);
        if (legacy !== null && legacy !== undefined) {
          try {
            await this.set(key, legacy);
          } catch {
            // migration write failed — value still returned from legacy
          }
        }
        return legacy;
      }
    }
    return readWeb<T>(key);
  },

  async set(key: string, value: unknown): Promise<void> {
    const serialized = JSON.stringify(value);
    if (Capacitor.isNativePlatform()) {
      await ensureKvDir();
      await Filesystem.writeFile({
        path: fileName(key),
        directory: Directory.Data,
        data: serialized,
        encoding: Encoding.UTF8,
      });
      return;
    }
    window.localStorage.setItem(key, serialized);
  },

  async remove(key: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.deleteFile({ path: fileName(key), directory: Directory.Data });
      } catch {
        // already gone — fine
      }
      return;
    }
    window.localStorage.removeItem(key);
  },
};
