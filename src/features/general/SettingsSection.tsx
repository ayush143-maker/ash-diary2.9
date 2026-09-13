'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { IconChevronRight } from '@/components/icons';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A titled settings group rendered as a single hairline card.
 * Spacious by design: the title gets breathing room above the card and
 * every row is tall enough to read calmly, never cramped.
 */
export function SettingsSection({ title, children, className }: SettingsSectionProps) {
  return (
    <section className={cn('mt-10', className)}>
      <h2 className="text-ink-3 mb-3 px-1.5 text-[11px] font-semibold tracking-[0.22em] uppercase">
        {title}
      </h2>
      <div className="bg-surface border-line divide-line divide-y overflow-hidden rounded-card border">
        {children}
      </div>
    </section>
  );
}

interface SettingRowProps {
  label: string;
  description?: string;
  /** Control rendered on the right (Toggle, chip, etc.) */
  control: React.ReactNode;
}

/**
 * A non-pressable row with a control on the right.
 */
export function SettingRow({ label, description, control }: SettingRowProps) {
  return (
    <div className="flex min-h-[72px] items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="text-ink text-[15px]">{label}</p>
        {description && (
          <p className="text-ink-3 mt-1 text-xs leading-relaxed">{description}</p>
        )}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

interface SettingPressRowProps {
  label: string;
  /** Current value shown on the right. */
  value: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * A pressable row that opens a picker sheet.
 */
export function SettingPressRow({ label, value, onPress, disabled }: SettingPressRowProps) {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={cn(
        'flex min-h-[64px] w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors',
        disabled
          ? 'pointer-events-none opacity-40'
          : 'hover:bg-surface-2 active:bg-surface-3'
      )}
    >
      <span className="text-ink text-[15px]">{label}</span>
      <span className="text-ink-2 flex items-center gap-1 text-sm">
        {value}
        <IconChevronRight size={15} className="text-ink-3" />
      </span>
    </button>
  );
}
