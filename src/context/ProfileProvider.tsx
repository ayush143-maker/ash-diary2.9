'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { UserProfile } from '@/types';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS, DEFAULT_PROFILE } from '@/lib/constants';

interface ProfileContextType {
  profile: UserProfile;
  isLoading: boolean;
  updateProfile: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const saved = await storage.get<UserProfile>(STORAGE_KEYS.profile);
      if (saved) setProfile((prev) => ({ ...prev, ...saved }));
      setIsLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      storage.set(STORAGE_KEYS.profile, profile);
    }
  }, [profile, isLoading]);

  const updateProfile = useCallback(<K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, isLoading, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
}
