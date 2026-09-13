'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '@/context/SettingsProvider';
import { useToast } from '@/context/ToastProvider';
import { requestNotificationPermission, syncDailyReminder } from '@/lib/notifications';
import { Toggle } from '@/components/ui/Toggle';
import { SheetPicker } from '@/components/ui/SheetPicker';
import { PermissionSheet } from '@/components/shared/PermissionSheet';
import { SettingsSection, SettingRow, SettingPressRow } from './SettingsSection';

const TIME_OPTIONS = ['08:00', '12:00', '18:00', '20:00', '21:00', '22:00'] as const;

function toFriendlyTime(value: string): string {
  const [hours = 0, minutes = 0] = value.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function RemindersSection() {
  const { settings, updateSetting, isLoading } = useSettings();
  const { showToast } = useToast();
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [prePromptOpen, setPrePromptOpen] = useState(false);
  const initialized = useRef(false);

  // Reschedule/cancel whenever the toggle or time actually changes.
  useEffect(() => {
    if (isLoading) return;
    if (!initialized.current) {
      initialized.current = true;
      // Keep the OS schedule in sync with a saved setting on cold start too.
      syncDailyReminder(settings.dailyReminder, settings.reminderTime);
      return;
    }
    syncDailyReminder(settings.dailyReminder, settings.reminderTime);
  }, [settings.dailyReminder, settings.reminderTime, isLoading]);

  const handleToggle = (checked: boolean) => {
    if (!checked) {
      updateSetting('dailyReminder', false);
      return;
    }
    setPrePromptOpen(true);
  };

  const confirmEnable = async () => {
    setPrePromptOpen(false);
    const granted = await requestNotificationPermission();
    if (!granted) {
      showToast('Notifications are off in device settings — reminders will stay paused.', 'info');
      return;
    }
    updateSetting('dailyReminder', true);
  };

  return (
    <SettingsSection title="Reminders">
      <SettingRow
        label="Daily reminder"
        description="A gentle nudge to write each day."
        control={
          <Toggle checked={settings.dailyReminder} onChange={handleToggle} />
        }
      />
      <SettingPressRow
        label="Reminder time"
        value={toFriendlyTime(settings.reminderTime)}
        onPress={() => setTimePickerOpen(true)}
        disabled={!settings.dailyReminder}
      />

      <SheetPicker
        isOpen={timePickerOpen}
        onClose={() => setTimePickerOpen(false)}
        title="Reminder time"
        options={TIME_OPTIONS.map((time) => ({
          value: time,
          label: toFriendlyTime(time),
        }))}
        value={settings.reminderTime}
        onSelect={(time) => updateSetting('reminderTime', time)}
      />

      <PermissionSheet
        isOpen={prePromptOpen}
        title="Daily reminders"
        description="ASH DIARY would like to send one gentle notification a day at your chosen time. You can turn this off again anytime."
        confirmLabel="Allow notifications"
        onConfirm={confirmEnable}
        onClose={() => setPrePromptOpen(false)}
      />
    </SettingsSection>
  );
}
