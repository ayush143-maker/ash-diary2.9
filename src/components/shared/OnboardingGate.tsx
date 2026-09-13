'use client';

import React, { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { Flower } from './Flower';
import { Button } from '@/components/ui/Button';

/**
 * Full-screen gate shown once, before storage.hasOnboarded is true.
 * Just a "Get started" tap — no name prompt. The greeting elsewhere
 * uses a fixed name (see DEFAULT_PROFILE), not something collected here.
 */
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    storage.get<boolean>(STORAGE_KEYS.hasOnboarded).then((value) => {
      setOnboarded(Boolean(value));
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <>{children}</>;
  if (onboarded) return <>{children}</>;

  const finish = () => {
    storage.set(STORAGE_KEYS.hasOnboarded, true);
    setOnboarded(true);
  };

  return (
    <div className="bg-canvas fixed inset-0 z-[70] flex flex-col">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-8 pt-safe pb-safe text-center">
        {/* One quiet flower, centred — the emblem of the app. */}
        <Flower size={104} className="text-ok" />
        <p className="text-ink-2 mt-7 max-w-[26ch] text-[15px] leading-relaxed">
          A quiet, private place to keep your days — in words and in your
          own voice.
        </p>
        <Button className="mt-10 w-full" onClick={finish}>
          Get started
        </Button>
      </div>
    </div>
  );
}
