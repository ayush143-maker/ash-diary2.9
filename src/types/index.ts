export type Mood = 
  | 'calm' 
  | 'grateful' 
  | 'hopeful' 
  | 'tired' 
  | 'anxious' 
  | 'heavy' 
  | 'alive';

export type ThemeMode = 'light' | 'dark' | 'system';
export type JournalStyle = 'freeform' | 'reflective' | 'gratitude';
export type TabId = 'me' | 'general' | 'content' | 'voice' | 'cloud';

export interface JournalEntry {
  id: string;
  title: string;
  body: string; // Markdown-lite
  mood?: Mood;
  voiceMemoryIds: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  cloudSynced?: boolean; // Phase 2 flag
}

export interface VoiceMemory {
  id: string;
  title: string;
  durationSec: number;
  createdAt: string; // ISO 8601
  audioSrc?: string; // undefined in Phase 1 (no real audio yet)
  cloudSynced?: boolean;
}

export interface UserProfile {
  name: string;
  imagePath?: string; // relative to /public/images/
}

export interface JournalSettings {
  theme: ThemeMode;
  defaultStyle: JournalStyle;
  autoSave: boolean;
  showTimestamps: boolean;
  defaultMood?: Mood;
  localOnlyMode: boolean;
  appLockEnabled: boolean; // placeholder for Phase 2 biometrics
  dailyReminder: boolean; // placeholder for Phase 2 notifications
  reminderTime: string;   // "21:00"
}

export interface CloudBackup {
  enabled: boolean;
  provider: 'none' | 'local-sim' | 'supabase';
  lastBackupAt?: string;
  usedBytes: number;
  uploadedEntryIds: string[];
  uploadedVoiceIds: string[];
}
