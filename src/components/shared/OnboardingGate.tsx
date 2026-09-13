'use client';

import React, { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';

type GatePhase = 'boot' | 'checking' | 'gate' | 'ready';

/**
 * Synchronous fast-path hint. localStorage.getItem is synchronous, so a
 * returning user is recognised on the very first client paint — no await,
 * no placeholder flash. The file-backed flag (storage.ts) remains the
 * source of truth; this is only a mirror written at finish() time.
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

/* ── Art ──────────────────────────────────────────────────────── */

/** The hero bloom: translucent teal petals, orange stamens, curved stem. */
function BloomHero({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 300" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ob-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E3F2EE" />
          <stop offset="100%" stopColor="#A9D6CD" />
        </linearGradient>
        <linearGradient id="ob-petal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#DFF2EE" />
          <stop offset="100%" stopColor="#BFE3DC" />
        </linearGradient>
        <radialGradient id="ob-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#F6EBDD" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#F6EBDD" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* soft warm glow behind the bloom */}
      <circle cx="150" cy="95" r="72" fill="url(#ob-glow)" />

      {/* stem — one gentle S-curve */}
      <path
        d="M128 292 C 120 250, 140 220, 132 180 C 128 158, 132 140, 138 122"
        stroke="#4BA39A"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* leaves with veins */}
      <path d="M131 190 C 112 184, 96 170, 90 152 C 108 158, 124 172, 131 190 Z" fill="url(#ob-leaf)" stroke="#4BA39A" strokeWidth="1" />
      <path d="M131 190 C 118 178, 106 166, 96 156" stroke="#4BA39A" strokeWidth="0.8" opacity="0.7" />
      <path d="M134 168 C 148 160, 158 148, 162 134 C 150 142, 140 154, 134 168 Z" fill="url(#ob-leaf)" stroke="#4BA39A" strokeWidth="1" />
      <path d="M134 168 C 144 156, 152 146, 158 138" stroke="#4BA39A" strokeWidth="0.8" opacity="0.7" />
      <path d="M129 236 C 112 232, 98 222, 92 206 C 108 212, 122 222, 129 236 Z" fill="url(#ob-leaf)" stroke="#4BA39A" strokeWidth="1" />
      <path d="M129 236 C 118 226, 108 216, 98 210" stroke="#4BA39A" strokeWidth="0.8" opacity="0.7" />
      <path d="M131 252 C 144 246, 154 236, 158 224 C 146 230, 137 240, 131 252 Z" fill="url(#ob-leaf)" stroke="#4BA39A" strokeWidth="1" />

      {/* bloom — five overlapping translucent petals */}
      <path d="M140 112 C 128 104, 120 90, 122 74 C 134 80, 142 96, 140 112 Z" fill="url(#ob-petal)" fillOpacity="0.9" stroke="#58ACA2" strokeWidth="1" />
      <path d="M140 112 C 138 94, 142 78, 152 66 C 158 80, 152 98, 140 112 Z" fill="url(#ob-petal)" fillOpacity="0.9" stroke="#58ACA2" strokeWidth="1" />
      <path d="M140 112 C 150 100, 164 92, 178 90 C 172 104, 158 112, 140 112 Z" fill="url(#ob-petal)" fillOpacity="0.9" stroke="#58ACA2" strokeWidth="1" />
      <path d="M140 112 C 152 110, 166 112, 176 118 C 166 126, 152 124, 140 112 Z" fill="url(#ob-petal)" fillOpacity="0.9" stroke="#58ACA2" strokeWidth="1" />
      <path d="M140 112 C 130 110, 120 112, 112 118 C 120 124, 132 122, 140 112 Z" fill="url(#ob-petal)" fillOpacity="0.9" stroke="#58ACA2" strokeWidth="1" />

      {/* stamens with warm dots */}
      <path d="M142 106 C 148 96, 154 88, 160 82" stroke="#D9A441" strokeWidth="1" strokeLinecap="round" />
      <circle cx="161" cy="81" r="2.2" fill="#E8B54D" />
      <path d="M143 108 C 150 100, 158 94, 166 90" stroke="#D9A441" strokeWidth="1" strokeLinecap="round" />
      <circle cx="167" cy="89" r="2.2" fill="#E8B54D" />
      <path d="M144 110 C 152 104, 160 100, 168 98" stroke="#D9A441" strokeWidth="1" strokeLinecap="round" />
      <circle cx="169" cy="97" r="2.2" fill="#E8B54D" />
      <path d="M141 104 C 146 92, 150 84, 154 76" stroke="#D9A441" strokeWidth="1" strokeLinecap="round" />
      <circle cx="155" cy="75" r="2.2" fill="#E8B54D" />
    </svg>
  );
}

/** A single drifting petal. */
function Petal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 14" fill="none" className={className} aria-hidden="true">
      <path
        d="M2 12 C 6 4, 14 1, 22 2 C 18 9, 10 13, 2 12 Z"
        fill="#BFE0DA"
        fillOpacity="0.9"
        stroke="#58ACA2"
        strokeWidth="0.8"
      />
    </svg>
  );
}

/** The little flourish under the headline. */
function Swash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 16" fill="none" className={className} aria-hidden="true">
      <path d="M6 10 C 40 3, 82 3, 114 9" stroke="#7FC4BC" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M34 13 C 56 9, 76 9, 94 12" stroke="#7FC4BC" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

/** Botanical corner sprig with berry dots — mirror it for the right side. */
function CornerSprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 170" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ob-corner-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E3F2EE" />
          <stop offset="100%" stopColor="#A9D6CD" />
        </linearGradient>
      </defs>
      <path d="M8 168 C 30 130, 40 100, 66 74" stroke="#4BA39A" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M20 170 C 44 140, 66 120, 96 108" stroke="#4BA39A" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4 150 C 20 138, 34 132, 52 128" stroke="#4BA39A" strokeWidth="1.1" strokeLinecap="round" opacity="0.9" />
      <path d="M40 128 C 30 118, 26 106, 28 94 C 38 102, 42 114, 40 128 Z" fill="url(#ob-corner-leaf)" stroke="#4BA39A" strokeWidth="0.9" />
      <path d="M58 106 C 52 94, 52 82, 58 70 C 64 80, 64 94, 58 106 Z" fill="url(#ob-corner-leaf)" stroke="#4BA39A" strokeWidth="0.9" />
      <path d="M74 118 C 70 106, 72 94, 80 84 C 84 94, 82 108, 74 118 Z" fill="url(#ob-corner-leaf)" stroke="#4BA39A" strokeWidth="0.9" />
      <path d="M92 112 C 92 100, 98 90, 108 84 C 106 96, 100 106, 92 112 Z" fill="url(#ob-corner-leaf)" stroke="#4BA39A" strokeWidth="0.9" />
      <circle cx="66" cy="74" r="2.4" fill="#7FC4BC" />
      <circle cx="96" cy="108" r="2.4" fill="#E8B54D" />
      <circle cx="52" cy="128" r="2" fill="#7FC4BC" />
      <circle cx="108" cy="84" r="2" fill="#E8B54D" />
    </svg>
  );
}

/* ── Gate ────────────────────────────────────────────────────── */

/**
 * Opening contract:
 *   🆕 First launch  → faint bloom → full art screen → Get started
 *   🔄 Returning     → skeleton → content (art never appears)
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
      setPhase('ready');
      return;
    }
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
      <div className="bg-canvas fixed inset-0 z-[70] overflow-hidden">
        {/* corner botanicals, bleeding off the edges */}
        <CornerSprig className="absolute -bottom-2 -left-4 w-[130px] opacity-90" />
        <CornerSprig className="absolute -bottom-2 -right-4 w-[130px] -scale-x-100 opacity-90" />

        {/* drifting petals */}
        <Petal className="absolute left-[16%] top-[11%] w-6 rotate-[-18deg]" />
        <Petal className="absolute left-[32%] top-[26%] w-5 rotate-[24deg]" />
        <Petal className="absolute right-[24%] top-[37%] w-6 rotate-[40deg]" />

        <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-8 pt-safe pb-safe text-center">
          <BloomHero className="w-[240px] max-w-[70%]" />

          <h1 className="font-display mt-6 text-[40px] leading-tight font-medium text-[#1d4f4c]">
            Just for you
          </h1>
          <Swash className="mt-1 w-[110px]" />

          <p className="mt-6 text-[15px] leading-relaxed text-[#7d8f8c]">
            A quiet, private place to keep your days —
            <br />
            in words and in your own voice.
          </p>

          {/* pill CTA — no arrow, as requested */}
          <button
            onClick={finish}
            className="press mt-12 w-full max-w-[280px] rounded-full py-4 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(24,154,143,0.55)] transition-opacity active:opacity-90"
            style={{ background: 'linear-gradient(90deg, #2ba9a4 0%, #189a8f 100%)' }}
          >
            Get started
          </button>
        </div>
      </div>
    );
  }

  // 'boot' = plain canvas (matches static HTML) · 'checking' = canvas +
  // faint bloom. Neither renders children, so the skeleton can never
  // leak ahead of the decision.
  return (
    <div
      className="bg-canvas fixed inset-0 z-[70] flex items-center justify-center"
      aria-hidden="true"
    >
      {phase === 'checking' && <BloomHero className="w-[240px] opacity-[0.08]" />}
    </div>
  );
}
