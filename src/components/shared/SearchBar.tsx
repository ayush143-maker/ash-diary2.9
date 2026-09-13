'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { IconSearch, IconX } from '../icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search your journal…',
  className,
}: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <IconSearch
        size={17}
        className="text-ink-3 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
      />
      <input
        type="search"
        role="searchbox"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          'bg-surface-2 border-line text-ink placeholder:text-ink-3 h-11 w-full rounded-full border pr-10 pl-11 text-[15px]',
          'focus:border-ember/40 focus:ring-ember/30 focus:outline-none focus:ring-2',
          'transition-colors'
        )}
      />
      {value.length > 0 && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="text-ink-3 hover:text-ink absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 transition-colors"
        >
          <IconX size={15} />
        </button>
      )}
    </div>
  );
}
