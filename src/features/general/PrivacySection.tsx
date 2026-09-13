'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsProvider';
import { Toggle } from '@/components/ui/Toggle';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SettingsSection, SettingRow, SettingPressRow } from './SettingsSection';

export function PrivacySection() {
  const { settings, updateSetting } = useSettings();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <SettingsSection title="Privacy">
      <SettingRow
        label="App lock"
        description="Biometric lock — not available in this build."
        control={
          <Toggle
            checked={settings.appLockEnabled}
            onChange={(checked) => updateSetting('appLockEnabled', checked)}
            disabled
          />
        }
      />
      <SettingRow
        label="Local-only mode"
        description="Memories never leave this device unless you back them up."
        control={
          <Toggle
            checked={settings.localOnlyMode}
            onChange={(checked) => updateSetting('localOnlyMode', checked)}
          />
        }
      />
      <SettingPressRow
        label="Privacy information"
        value=""
        onPress={() => setInfoOpen(true)}
      />

      <BottomSheet
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="Privacy at ASH DIARY"
      >
        <ol className="text-ink-2 space-y-4 pb-4 text-sm leading-relaxed">
          <li className="flex gap-3">
            <span className="text-ember font-display shrink-0 text-base">1.</span>
            <span>Everything stays on your device by default. Nothing is sent anywhere on its own.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-ember font-display shrink-0 text-base">2.</span>
            <span>Cloud backup is optional and item-by-item — you choose exactly what leaves this device, and can turn it off anytime.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-ember font-display shrink-0 text-base">3.</span>
            <span>Encrypted sync isn&rsquo;t built yet, so anything you do back up is stored as-is on the server.</span>
          </li>
        </ol>
      </BottomSheet>
    </SettingsSection>
  );
}
