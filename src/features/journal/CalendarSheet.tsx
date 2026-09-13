'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { JournalEntry } from '@/types';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { IconChevronLeft, IconChevronRight } from '@/components/icons';
import { cn } from '@/lib/cn';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

/** Local-timezone date key: YYYY-MM-DD. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface CalendarSheetProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

/**
 * A quiet month calendar. Days holding memories are marked with an ember
 * dot; tapping a day filters the journal to that date.
 */
export function CalendarSheet({
  isOpen,
  onClose,
  entries,
  selectedDate,
  onSelectDate,
}: CalendarSheetProps) {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Re-open on the month of the selected date (or today).
  useEffect(() => {
    if (!isOpen) return;
    const base = selectedDate
      ? new Date(`${selectedDate}T00:00:00`)
      : new Date();
    setViewDate(new Date(base.getFullYear(), base.getMonth(), 1));
  }, [isOpen, selectedDate]);

  const entryDates = useMemo(
    () => new Set(entries.map((entry) => toDateKey(new Date(entry.createdAt)))),
    [entries]
  );

  const grid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<Date | null> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  }, [viewDate]);

  const todayKey = toDateKey(new Date());

  const changeMonth = (delta: number) => {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  const handleDayTap = (date: Date) => {
    const key = toDateKey(date);
    if (key === selectedDate) {
      onSelectDate(null);
    } else {
      onSelectDate(key);
      onClose();
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Calendar">
      <div className="pb-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="press text-ink-2 hover:bg-surface-2 hover:text-ink flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          >
            <IconChevronLeft size={20} />
          </button>
          <p className="font-display text-ink text-base font-medium">
            {MONTH_FORMATTER.format(viewDate)}
          </p>
          <button
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="press text-ink-2 hover:bg-surface-2 hover:text-ink flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          >
            <IconChevronRight size={20} />
          </button>
        </div>

        {/* Weekday header */}
        <div className="mt-4 grid grid-cols-7">
          {WEEKDAYS.map((weekday) => (
            <span
              key={weekday}
              className="text-ink-3 py-1 text-center text-[11px] font-semibold tracking-wide uppercase"
            >
              {weekday}
            </span>
          ))}
        </div>

        {/* Day grid */}
        <div className="mt-1 grid grid-cols-7 gap-y-1">
          {grid.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} />;

            const key = toDateKey(date);
            const isSelected = key === selectedDate;
            const isToday = key === todayKey;
            const hasEntry = entryDates.has(key);

            return (
              <button
                key={key}
                onClick={() => handleDayTap(date)}
                aria-pressed={isSelected}
                className={cn(
                  'press relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors',
                  isSelected
                    ? 'bg-ember text-on-ember font-semibold'
                    : isToday
                      ? 'text-ember font-semibold'
                      : 'text-ink hover:bg-surface-2'
                )}
              >
                {date.getDate()}
                {isToday && !isSelected && (
                  <span className="ring-ember/40 absolute inset-0 rounded-full ring-1" />
                )}
                {hasEntry && !isSelected && (
                  <span className="bg-ember absolute bottom-1 h-1 w-1 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <p className="text-ink-3 mt-4 px-1 text-xs">
          Days marked with a dot hold memories.
        </p>

        {selectedDate && (
          <div className="border-line mt-4 border-t pt-4">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                onSelectDate(null);
                onClose();
              }}
            >
              Clear selected date
            </Button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
