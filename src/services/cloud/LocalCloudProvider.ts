import type { JournalEntry, VoiceMemory } from '@/types';
import type { CloudProvider, UploadProgress } from './types';

export class LocalCloudProvider implements CloudProvider {
  async uploadItems(
    entries: JournalEntry[],
    voiceMemories: VoiceMemory[],
    onProgress: (progress: UploadProgress[]) => void
  ): Promise<{ success: boolean; error?: string }> {
    const allIds = [...entries.map((e) => e.id), ...voiceMemories.map((v) => v.id)];
    
    const progressState: UploadProgress[] = allIds.map(id => ({
      id,
      status: 'pending' as const,
      progress: 0,
    }));
    onProgress(progressState);

    for (let i = 0; i < allIds.length; i++) {
      const id = allIds[i];
      progressState[i].status = 'uploading';
      onProgress([...progressState]);

      // Simulate chunked upload
      for (let p = 0; p <= 100; p += 10) {
        await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 80));
        progressState[i].progress = p;
        onProgress([...progressState]);
      }

      // 10% chance of simulated network failure for UX testing
      if (Math.random() < 0.1) {
        progressState[i].status = 'error';
        progressState[i].error = 'Network timeout';
        onProgress([...progressState]);
        return { success: false, error: 'Upload failed due to a simulated network error.' };
      }

      progressState[i].status = 'success';
      progressState[i].progress = 100;
      onProgress([...progressState]);
    }

    return { success: true };
  }

  async getStorageUsed(): Promise<number> {
    return 0; 
  }
}
