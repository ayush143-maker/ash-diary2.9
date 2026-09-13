'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { JournalEntry, VoiceMemory } from '@/types';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { SEED_ENTRIES, SEED_VOICE_MEMORIES } from '@/data/seed';
import { generateId } from '@/lib/ids';
import { useToast } from './ToastProvider';

interface JournalContextType {
  entries: JournalEntry[];
  voiceMemories: VoiceMemory[];
  isLoading: boolean;
  createEntry: (title?: string) => JournalEntry;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  createVoiceMemory: (title: string, durationSec: number, audioSrc?: string) => VoiceMemory;
  deleteVoiceMemory: (id: string) => void;
  getStreak: () => number;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [voiceMemories, setVoiceMemories] = useState<VoiceMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Load data on mount (with seeding if empty)
  useEffect(() => {
    const load = async () => {
      const savedEntries = await storage.get<JournalEntry[]>(STORAGE_KEYS.entries);
      const savedVoices = await storage.get<VoiceMemory[]>(STORAGE_KEYS.voiceMemories);

      if (savedEntries && savedEntries.length > 0) {
        setEntries(savedEntries);
      } else {
        setEntries(SEED_ENTRIES);
        await storage.set(STORAGE_KEYS.entries, SEED_ENTRIES);
      }

      if (savedVoices && savedVoices.length > 0) {
        setVoiceMemories(savedVoices);
      } else {
        setVoiceMemories(SEED_VOICE_MEMORIES);
        await storage.set(STORAGE_KEYS.voiceMemories, SEED_VOICE_MEMORIES);
      }

      setIsLoading(false);
    };
    load();
  }, []);

  // Persist entries on change
  useEffect(() => {
    if (!isLoading && entries.length > 0) {
      storage.set(STORAGE_KEYS.entries, entries);
    }
  }, [entries, isLoading]);

  // Persist voice memories on change
  useEffect(() => {
    if (!isLoading && voiceMemories.length > 0) {
      storage.set(STORAGE_KEYS.voiceMemories, voiceMemories);
    }
  }, [voiceMemories, isLoading]);

  const createEntry = useCallback((title = 'Untitled Entry') => {
    const now = new Date().toISOString();
    const newEntry: JournalEntry = {
      id: generateId(),
      title,
      body: '',
      voiceMemoryIds: [],
      createdAt: now,
      updatedAt: now,
    };
    setEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<JournalEntry>) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id 
          ? { ...entry, ...updates, updatedAt: new Date().toISOString() } 
          : entry
      )
    );
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    showToast('Entry deleted', 'info');
  }, [showToast]);

  const createVoiceMemory = useCallback((title: string, durationSec: number, audioSrc?: string) => {
    const newVoice: VoiceMemory = {
      id: generateId(),
      title,
      durationSec,
      createdAt: new Date().toISOString(),
      audioSrc, // Phase 2: local file URI from useRecorder, or undefined if capture failed
    };
    setVoiceMemories((prev) => [newVoice, ...prev]);
    showToast('Voice memory saved', 'success');
    return newVoice;
  }, [showToast]);

  const deleteVoiceMemory = useCallback((id: string) => {
    setVoiceMemories((prev) => prev.filter((voice) => voice.id !== id));
    // Also remove from any entries that reference it
    setEntries((prev) =>
      prev.map((entry) => ({
        ...entry,
        voiceMemoryIds: entry.voiceMemoryIds.filter((vid) => vid !== id),
      }))
    );
    showToast('Voice memory deleted', 'info');
  }, [showToast]);

  const getStreak = useCallback(() => {
    if (entries.length === 0) return 0;
    
    // Simple streak calculation: count consecutive days with entries ending today/yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    const checkDate = new Date(today);
    
    while (true) {
      const hasEntry = entries.some((entry) => {
        const entryDate = new Date(entry.createdAt);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });
      
      if (hasEntry) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }, [entries]);

  const value = useMemo(() => ({
    entries,
    voiceMemories,
    isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
    createVoiceMemory,
    deleteVoiceMemory,
    getStreak,
  }), [
    entries, voiceMemories, isLoading, 
    createEntry, updateEntry, deleteEntry, 
    createVoiceMemory, deleteVoiceMemory, getStreak
  ]);

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) throw new Error('useJournal must be used within a JournalProvider');
  return context;
}
