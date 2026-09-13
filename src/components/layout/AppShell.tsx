"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BottomNavigation } from "./BottomNavigation";
import { OnboardingGate } from "@/components/shared/OnboardingGate";
import { BackButtonHandler } from "@/components/shared/BackButtonHandler";

/**
 * The phone-frame shell.
 *
 * - Constrains the app to a 430px column (mobile-first; desktop gets a
 *   contained device-like column, never a dashboard).
 * - Keys <main> by pathname for a subtle page-transition fade.
 * - Adds bottom padding so content never hides behind the navigation.
 * - Hides navigation on editor routes (distraction-free writing).
 * - Gates everything behind onboarding until a name is set.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEditorRoute = pathname.startsWith("/journal/");

  return (
    <OnboardingGate>
      <BackButtonHandler />
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
        <main
          key={pathname}
          className={cn(
            "animate-fade-in flex-1 pt-safe",
            !isEditorRoute && "pb-24"
          )}
        >
          {children}
        </main>
        {!isEditorRoute && <BottomNavigation />}
      </div>
    </OnboardingGate>
  );
}
