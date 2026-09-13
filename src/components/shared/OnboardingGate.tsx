'use client';

import React, { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { Flower } from './Flower';

type GatePhase = 'boot' | 'checking' | 'gate' | 'ready';

/**
 * Synchronous fast-path hint. localStorage.getItem is synchronous, so a
 * returning user is recognised on the very first client paint — no await,
 * no placeholder flash. The file-backed flag (storage.ts) remains the
 * source of truth; this is only a mirror written at finish() time.
 * Legacy installs already carry this key from the old localStorage-based
 * storage layer, so they get the fast path for free.
 */
function readFastHint(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEYS.hasOnboarded) === 'true';
  } catch {
    return false;
  }
}

function writeFastHint(): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.hasOnboarded, 'true');
  } catch {
    /* private mode etc. — the async path still works */
  }
}

/**
 * The poster art for the Get Started card — a calm, geometric
 * composition in the app's own palette: ink outline circles and arcs
 * cropping off the card edges, a sage-filled circle, a solid ember
 * wedge, and one soft sage→ember gradient orb. No holographics, no
 * noise — just quiet shapes with confidence.
 */
function GateArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 340"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gateart-orb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-ok, #8FA98F)" stopOpacity="0.55" />
          <stop offset="55%" stopColor="var(--color-ember-wash, #EAF0E6)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-ember, #3E8E7E)" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* big arcs cropping off the edges */}
      <circle cx="268" cy="52" r="150" stroke="var(--color-ink, #22302A)" strokeWidth="3" opacity="0.9" />
      <circle cx="36" cy="318" r="120" stroke="var(--color-ink, #22302A)" strokeWidth="3" opacity="0.9" />

      {/* sage filled circle, left */}
      <circle
        cx="64"
        cy="132"
        r="52"
        fill="var(--color-ok, #8FA98F)"
        fillOpacity="0.35"
        stroke="var(--color-ink, #22302A)"
        strokeWidth="3"
      />

      {/* centre circle */}
      <circle cx="172" cy="204" r="95" stroke="var(--color-ink, #22302A)" strokeWidth="3" />

      {/* solid ember wedge — the quiet focal point */}
      <path d="M 172 204 L 77 204 A 95 95 0 0 1 172 109 Z" fill="var(--color-ember, #3E8E7E)" />

      {/* soft gradient orb */}
      <circle
        cx="206"
        cy="240"
        r="56"
        fill="url(#gateart-orb)"
        stroke="var(--color-ink, #22302A)"
        strokeWidth="3"
      />

      {/* small ivory circle, top right */}
      <circle
        cx="252"
        cy="112"
        r="16"
        fill="var(--color-canvas, #F7F9F0)"
        stroke="var(--color-ink, #22302A)"
        strokeWidth="3"
      />
    </svg>
  );
}

/**
 * Opening contract:
 *   🆕 First launch  → faint flower → Get Started card
 *   🔄 Returning     → skeleton → content (no flower, no card)
 *   ⏱ Delay          → none; every phase lasts only as long as its real work
 *
 * 'boot' renders a plain canvas identical to the pre-hydration static
 * HTML (no hydration mismatch, and children — hence the MeHome skeleton —
 * never mount before the decision).
 */
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<GatePhase>('boot');

  useEffect(() => {
    if (readFastHint()) {
      // Returning user: straight into the app — their own skeleton shows.
      setPhase('ready');
      return;
    }
    // Unknown: quiet canvas + extremely faint flower while the real
    // (file-backed) flag is confirmed. Lasts exactly one read — no timer.
    setPhase('checking');
    let alive = true;
    storage.get<boolean>(STORAGE_KEYS.hasOnboarded).then((value) => {
      if (!alive) return;
      if (value) {
        writeFastHint(); // heal the hint for future cold starts
        setPhase('ready');
      } else {
        setPhase('gate');
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const finish = () => {
    storage.set(STORAGE_KEYS.hasOnboarded, true);
    writeFastHint();
    setPhase('ready');
  };

  if (phase === 'ready') return <>{children}</>;

  if (phase === 'gate') {
    return (
      <div className="bg-canvas fixed inset-0 z-[70] flex flex-col">
        <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-8 pt-safe pb-safe">
          {/* The poster card — art on top, one bold lowercase call to
              action where a wordmark would sit, nothing else. */}
          <div className="bg-ok/20 w-full max-w-[340px] overflow-hidden rounded-[28px] p-6">
            <GateArt className="block h-auto w-full" />
            <button
              onClick={finish}
              className="press bg-ember text-on-ember font-display mt-6 w-full rounded-control py-4 text-xl font-semibold tracking-tight lowercase transition-opacity active:opacity-90"
            >
              get started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 'boot' = plain canvas (matches static HTML) · 'checking' = canvas +
  // faint flower. Neither renders children, so the skeleton can never
  // leak ahead of the decision.
  return (
    <div
      className="bg-canvas fixed inset-0 z-[70] flex items-center justify-center"
      aria-hidden="true"
    >
      {phase === 'checking' && (
        <Flower size={150} className="text-ember opacity-[0.08]" />
      )}
    </div>
  );
}
