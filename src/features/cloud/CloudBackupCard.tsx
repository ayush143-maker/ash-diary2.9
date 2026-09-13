import React from 'react';
import type { CloudBackup } from '@/types';
import { getRelativeTime } from '@/lib/dates';
import { formatBytes } from '@/lib/format';
import { cn } from '@/lib/cn';
import { IconCloud } from '@/components/icons';

interface CloudBackupCardProps {
  backup: CloudBackup;
}

export function CloudBackupCard({ backup }: CloudBackupCardProps) {
  return (
    <div className="bg-surface border-line rounded-card border">
      {/* Status row */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              backup.enabled ? 'bg-ok-wash text-ok' : 'bg-surface-2 text-ink-3'
            )}
          >
            <IconCloud size={18} />
          </span>
          <div>
            <p className="text-ink text-[15px] font-medium">Cloud Backup</p>
          </div>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase',
            backup.enabled ? 'bg-ok-wash text-ok' : 'bg-surface-2 text-ink-3'
          )}
        >
          {backup.enabled ? 'On' : 'Off'}
        </span>
      </div>

      {/* Metrics */}
      <div className="border-line divide-line grid grid-cols-2 divide-x border-t">
        <div className="px-5 py-3.5">
          <p className="text-ink-3 text-[10px] font-semibold tracking-[0.18em] uppercase">
            Last backup
          </p>
          <p className="text-ink mt-1 text-sm font-medium">
            {backup.lastBackupAt ? getRelativeTime(backup.lastBackupAt) : 'Never'}
          </p>
        </div>
        <div className="px-5 py-3.5">
          <p className="text-ink-3 text-[10px] font-semibold tracking-[0.18em] uppercase">
            Storage used
          </p>
          <p className="text-ink mt-1 text-sm font-medium">
            {backup.usedBytes === 0 ? '0 MB' : formatBytes(backup.usedBytes)}
          </p>
        </div>
      </div>
    </div>
  );
}
