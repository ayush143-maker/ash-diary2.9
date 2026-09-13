'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export type EditorAction =
  | 'bold'
  | 'italic'
  | 'heading'
  | 'bullet'
  | 'quote'
  | 'divider';

interface EditorToolbarProps {
  onAction: (action: EditorAction) => void;
  className?: string;
}

/**
 * A quiet formatting strip — typographic glyphs, not a Word ribbon.
 * Actions insert/toggle Markdown-lite syntax in the writing area.
 */
export function EditorToolbar({ onAction, className }: EditorToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className={cn('border-line mt-4 flex items-center gap-1 border-y py-1.5', className)}
    >
      <ToolbarButton label="Bold" onClick={() => onAction('bold')}>
        <span className="text-[15px] font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton label="Italic" onClick={() => onAction('italic')}>
        <span className="font-display text-[15px] italic">I</span>
      </ToolbarButton>
      <ToolbarButton label="Heading" onClick={() => onAction('heading')}>
        <span className="font-display text-[15px] font-semibold">H</span>
      </ToolbarButton>
      <ToolbarButton label="Bullet list" onClick={() => onAction('bullet')}>
        <ListGlyph />
      </ToolbarButton>
      <ToolbarButton label="Quote" onClick={() => onAction('quote')}>
        <span className="font-display text-[20px] leading-none">“</span>
      </ToolbarButton>
      <ToolbarButton label="Divider" onClick={() => onAction('divider')}>
        <span className="block h-px w-4 bg-current" />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="press text-ink-2 hover:bg-surface-2 hover:text-ink flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
    >
      {children}
    </button>
  );
}

function ListGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
