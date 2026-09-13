'use client';

import React from 'react';
import { BottomSheet } from './BottomSheet';
import { IconCheck } from '../icons';
import { cn } from '@/lib/cn';

interface Option<T> {
  value: T;
  label: string;
}

interface SheetPickerProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: Option<T>[];
  value: T;
  onSelect: (value: T) => void;
}

export function SheetPicker<T extends string | number>({ 
  isOpen, onClose, title, options, value, onSelect 
}: SheetPickerProps<T>) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-1 pb-4">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              onSelect(opt.value);
              onClose();
            }}
            className={cn(
              "flex items-center justify-between px-4 py-3.5 rounded-control text-left transition-colors",
              value === opt.value ? "bg-ember-wash text-ember" : "text-ink hover:bg-surface-3"
            )}
          >
            <span className="text-base font-medium">{opt.label}</span>
            {value === opt.value && <IconCheck size={20} />}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
