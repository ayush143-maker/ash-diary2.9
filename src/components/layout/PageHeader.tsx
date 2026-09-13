"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { IconChevronLeft } from "../icons";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** When provided, a back button is rendered on the left. */
  onBack?: () => void;
  /** Optional right-side action (icon button, chip, etc.) */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Consistent screen header used across tabs and the editor.
 */
export function PageHeader({
  title,
  subtitle,
  onBack,
  action,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("px-5", className)}>
      {(onBack || action) && (
        <div className="flex h-11 items-center justify-between">
          {onBack ? (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="press text-ink-2 hover:bg-surface-2 hover:text-ink -ml-2.5 flex h-11 w-11 items-center justify-center rounded-full transition-colors"
            >
              <IconChevronLeft size={22} />
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
          {action}
        </div>
      )}

      <h1 className="font-display text-ink text-[28px] leading-tight font-medium tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-ink-2 mt-1 text-sm leading-relaxed">{subtitle}</p>
      )}
    </header>
  );
}
