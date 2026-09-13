import React from 'react';

/**
 * A single calm line-art flower — the onboarding emblem.
 *
 * Redrawn in the thin, organic outline style: one S-curved stem, three
 * leaves with midribs, and a bloom of four overlapping open petals with
 * fine stamen lines fanning into them. Strokes only (plus a whisper of
 * fill), so it reads as a quiet sketch on the ivory canvas — used at
 * full strength nowhere, and extremely faint during the gate's storage
 * check. Same stroke language as <Sprig /> keeps one botanical voice.
 */
export function Flower({ size = 150, className }: { size?: number; className?: string }) {
  const width = Math.round((size * 96) / 160);
  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 96 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* stem — one continuous S-curve */}
      <path d="M 52 152 C 44 128, 60 112, 50 88 C 46 78, 48 70, 50 60" />

      {/* left leaf + midrib */}
      <path d="M 48 112 C 36 108, 26 98, 22 86 C 34 90, 44 100, 48 112 Z" fill="currentColor" fillOpacity="0.04" />
      <path d="M 48 112 C 40 104, 32 96, 24 88" />

      {/* right lower leaf + midrib */}
      <path d="M 54 130 C 64 126, 72 118, 76 108 C 66 112, 58 120, 54 130 Z" fill="currentColor" fillOpacity="0.04" />
      <path d="M 54 130 C 62 122, 68 116, 74 110" />

      {/* small right upper leaf */}
      <path d="M 52 86 C 58 82, 62 76, 64 70 C 58 74, 54 80, 52 86 Z" fill="currentColor" fillOpacity="0.04" />

      {/* bloom — four overlapping open petals */}
      <path d="M 50 58 C 42 52, 38 42, 40 32 C 48 36, 52 46, 50 58 Z" fill="currentColor" fillOpacity="0.05" />
      <path d="M 50 58 C 48 46, 50 34, 56 26 C 60 36, 56 48, 50 58 Z" fill="currentColor" fillOpacity="0.05" />
      <path d="M 50 58 C 56 50, 64 44, 72 42 C 68 52, 60 58, 50 58 Z" fill="currentColor" fillOpacity="0.05" />
      <path d="M 50 58 C 58 56, 68 56, 76 60 C 68 66, 58 64, 50 58 Z" fill="currentColor" fillOpacity="0.05" />

      {/* stamen lines fanning into the petals */}
      <path d="M 50 58 C 48 50, 46 44, 44 38" />
      <path d="M 50 58 C 52 48, 54 42, 58 36" />
      <path d="M 50 58 C 56 52, 60 48, 66 46" />
    </svg>
  );
}
