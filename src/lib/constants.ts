import type { JournalSettings, UserProfile } from '@/types';

export const APP_NAME = 'ASH DIARY';

export const ROUTES = {
  me: '/',
  general: '/general',
  content: '/journal',
  voice: '/voice',
  cloud: '/cloud',
} as const;

export const STORAGE_KEYS = {
  settings: 'ash_diary_settings',
  entries: 'ash_diary_entries',
  voiceMemories: 'ash_diary_voice_memories',
  cloudBackup: 'ash_diary_cloud_backup',
  profile: 'ash_diary_profile',
  hasOnboarded: 'ash_diary_onboarded',
} as const;

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Ash',
};

export const DEFAULT_SETTINGS: JournalSettings = {
  theme: 'dark',
  defaultStyle: 'freeform',
  autoSave: true,
  showTimestamps: true,
  localOnlyMode: true,
  appLockEnabled: false,
  dailyReminder: false,
  reminderTime: '21:00',
};

export const IMAGE_PATHS = {
  // User will drop their image here later.
  profile: '/images/profile.png', 
  fallback: '/app-icon.png',
} as const;
