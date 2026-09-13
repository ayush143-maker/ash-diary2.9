import type { JournalEntry, VoiceMemory } from '@/types';

export interface UploadProgress {
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number; // 0-100
  error?: string;
}

export interface CloudProvider {
  uploadItems(
    entries: JournalEntry[],
    voiceMemories: VoiceMemory[],
    onProgress: (progress: UploadProgress[]) => void
  ): Promise<{ success: boolean; error?: string }>;

  getStorageUsed(): Promise<number>; // in bytes
}
