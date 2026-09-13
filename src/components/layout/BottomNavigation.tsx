"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/constants";
import {
  IconUser,
  IconBook,
  IconMic,
  IconCloud,
} from "../icons";

const TABS = [
  { id: "me", label: "ME", href: ROUTES.me, Icon: IconUser },
  { id: "content", label: "CONTENT", href: ROUTES.content, Icon: IconBook },
  { id: "voice", label: "VOICE", href: ROUTES.voice, Icon: IconMic },
  { id: "cloud", label: "CLOUD", href: ROUTES.cloud, Icon: IconCloud },
] as const;

/**
 * Compact, mobile-native bottom navigation.
 * Fixed to the bottom of the 430px app column, safe-area aware.
 */
export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px]"
    >
      <div className="bg-surface border-line border-t pb-safe">
        <div className="flex h-[52px] items-stretch justify-around px-1">
          {TABS.map(({ id, label, href, Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={id}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className="group flex min-w-[56px] flex-1 flex-col items-center justify-center gap-0.5"
              >
                <span
                  className={cn(
                    "flex h-6 w-11 items-center justify-center rounded-full transition-colors duration-200",
                    isActive
                      ? "bg-ember-wash text-ember"
                      : "text-ink-3 group-hover:text-ink-2 group-active:bg-surface-3"
                  )}
                >
                  <Icon size={19} />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-[0.08em] transition-colors duration-200",
                    isActive ? "text-ember" : "text-ink-3"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
