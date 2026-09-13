'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJournal } from '@/context/JournalProvider';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SearchBar } from '@/components/shared/SearchBar';
import { CalendarButton } from '@/components/shared/CalendarButton';
import { JournalCard } from '@/components/shared/JournalCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Fab } from '@/components/shared/Fab';
import { IconBook, IconPlus, IconSearch } from '@/components/icons';
import { JournalFilters, type JournalFilter } from './JournalFilters';
import { CalendarSheet, toDateKey } from './CalendarSheet';

/**
 * CONTENT — the written journal: search, filters, calendar, and the list.
 */
export function JournalList() {
  const router = useRouter();
  const { entries, isLoading } = useJournal();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 200);
  const [filter, setFilter] = useState<JournalFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const filteredEntries = useMemo(() => {
    let list = [...entries].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );

    if (filter === 'voice') {
      list = list.filter((entry) => entry.voiceMemoryIds.length > 0);
    } else if (filter !== 'all') {
      list = list.filter((entry) => entry.mood === filter);
    }

    if (selectedDate) {
      list = list.filter(
        (entry) => toDateKey(new Date(entry.createdAt)) === selectedDate
      );
    }

    const text = debouncedQuery.trim().toLowerCase();
    if (text) {
      list = list.filter(
        (entry) =>
          entry.title.toLowerCase().includes(text) ||
          entry.body.toLowerCase().includes(text)
      );
    }

    return list;
  }, [entries, filter, selectedDate, debouncedQuery]);

  const clearEverything = () => {
    setQuery('');
    setFilter('all');
    setSelectedDate(null);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3">
          <SearchBar value={query} onChange={setQuery} className="flex-1" />
          <CalendarButton
            onClick={() => setCalendarOpen(true)}
            active={Boolean(selectedDate)}
          />
        </div>
        <JournalFilters value={filter} onChange={setFilter} />
      </div>

      {/* List */}
      <div className="mt-5">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-36 w-full rounded-card" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<IconBook size={24} />}
            title="Your journal is empty"
            description="Every memory starts with a single line. Write your first entry."
            actionLabel="Write your first entry"
            onAction={() => router.push('/journal/write')}
          />
        ) : filteredEntries.length === 0 ? (
          <EmptyState
            icon={<IconSearch size={24} />}
            title="No memories match"
            description="Try a different search, or clear your filters."
            actionLabel="Clear filters"
            onAction={clearEverything}
          />
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <JournalCard
                key={entry.id}
                entry={entry}
                onClick={() => router.push(`/journal/write?id=${entry.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <CalendarSheet
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        entries={entries}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {!isLoading && entries.length > 0 && (
        <Fab
          onClick={() => router.push('/journal/write')}
          aria-label="New entry"
          icon={<IconPlus size={22} />}
        />
      )}
    </div>
  );
}
