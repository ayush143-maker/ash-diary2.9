'use client';

import React, { useState } from 'react';
import type { JournalStyle, Mood } from '@/types';
import { useSettings } from '@/context/SettingsProvider';
import { Toggle } from '@/components/ui/Toggle';
import { SheetPicker } from '@/components/ui/SheetPicker';
import { MOOD_META, ALL_MOODS } from '@/components/shared/MoodBadge';
import { SettingsSection, SettingRow, SettingPressRow } from './SettingsSection';

const STYLE_OPTIONS: Array<{ value: JournalStyle; label: string }> = [
  { value: 'freeform', label: 'Freeform' },
  { value: 'reflective', label: 'Reflective' },
  { value: 'gratitude', label: 'Gratitude' },
];

const STYLE_LABEL: Record<JournalStyle, string> = {
  freeform: 'Freeform',
  reflective: 'Reflective',
  gratitude: 'Gratitude',
};

type MoodChoice = Mood | 'none';

export function JournalPrefsSection() {
  const { settings, updateSetting } = useSettings();
  const [stylePickerOpen, setStylePickerOpen] = useState(false);
  const [moodPickerOpen, setMoodPickerOpen] = useState(false);

  const moodOptions: Array<{ value: MoodChoice; label: string }> = [
    { value: 'none', label: 'No default mood' },
    ...ALL_MOODS.map((mood) => ({
      value: mood,
      label: MOOD_META[mood].label,
    })),
  ];

  const moodLabel = settings.defaultMood
    ? MOOD_META[settings.defaultMood].label
    : 'None';

  return (
    <SettingsSection title="Journal">
      <SettingPressRow
        label="Default journal style"
        value={STYLE_LABEL[settings.defaultStyle]}
        onPress={() => setStylePickerOpen(true)}
      />
      <SettingRow
        label="Auto-save"
        description="Your words are kept as you write."
        control={
          <Toggle
            checked={settings.autoSave}
            onChange={(checked) => updateSetting('autoSave', checked)}
          />
        }
      />
      <SettingRow
        label="Show timestamps"
        description="Display dates on entries and cards."
        control={
          <Toggle
            checked={settings.showTimestamps}
            onChange={(checked) => updateSetting('showTimestamps', checked)}
          />
        }
      />
      <SettingPressRow
        label="Default mood"
        value={moodLabel}
        onPress={() => setMoodPickerOpen(true)}
      />

      <SheetPicker
        isOpen={stylePickerOpen}
        onClose={() => setStylePickerOpen(false)}
        title="Default journal style"
        options={STYLE_OPTIONS}
        value={settings.defaultStyle}
        onSelect={(style) => updateSetting('defaultStyle', style)}
      />

      <SheetPicker<MoodChoice>
        isOpen={moodPickerOpen}
        onClose={() => setMoodPickerOpen(false)}
        title="Default mood"
        options={moodOptions}
        value={settings.defaultMood ?? 'none'}
        onSelect={(choice) =>
          updateSetting('defaultMood', choice === 'none' ? undefined : choice)
        }
      />
    </SettingsSection>
  );
}
