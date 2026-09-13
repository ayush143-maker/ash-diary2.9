'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { JournalSettings } from '@/types';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/lib/constants';

interface SettingsContextType {
  settings: JournalSettings;
  isLoading: boolean;
  updateSetting: <K extends keyof JournalSettings>(key: K, value: JournalSettings[K]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<JournalSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const load = async () => {
      const saved = await storage.get<JournalSettings>(STORAGE_KEYS.settings);
      if (saved) {
        setSettings((prev) => ({ ...prev, ...saved }));
      }
      setIsLoading(false);
    };
    load();
  }, []);

  // Persist settings on change
  useEffect(() => {
    if (!isLoading) {
      storage.set(STORAGE_KEYS.settings, settings);
    }
  }, [settings, isLoading]);

  const updateSetting = useCallback(<K extends keyof JournalSettings>(
    key: K, 
    value: JournalSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}
