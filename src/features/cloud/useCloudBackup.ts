'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CloudBackup } from '@/types';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';

const DEFAULT_BACKUP: CloudBackup = {
  enabled: false,
  provider: 'none',
  usedBytes: 0,
  uploadedEntryIds: [],
  uploadedVoiceIds: [],
};

/**
 * Cloud backup state, persisted through the storage adapter.
 * In Phase 2 this hook delegates to Supabase for backup metadata.
 */
export function useCloudBackup() {
  const [backup, setBackupState] = useState<CloudBackup>(DEFAULT_BACKUP);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const saved = await storage.get<CloudBackup>(STORAGE_KEYS.cloudBackup);
      if (saved) setBackupState({ ...DEFAULT_BACKUP, ...saved });
      setIsLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!isLoading) storage.set(STORAGE_KEYS.cloudBackup, backup);
  }, [backup, isLoading]);

  const setBackup = useCallback((next: CloudBackup) => {
    setBackupState(next);
  }, []);

  return { backup, isLoading, setBackup };
}
