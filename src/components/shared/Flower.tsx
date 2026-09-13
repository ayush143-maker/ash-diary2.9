import React from 'react';

/**
 * A single calm line-art flower — the onboarding emblem.
 * Six petals around a small centre, one curved stem and two leaves,
 * drawn in the same stroke language as <Sprig /> so the app keeps one
 * botanical voice. Static by design: the first screen should feel still.
 */
export function Flower({ size = 104, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      {/* stem */}
      <path d="M 32 58 Q 30.8 47 32 36" />
      {/* leaves */}
      <path d="M 31.4 49 Q 24.5 47.5 20.8 40.5 Q 26.5 42.5 31.4 49" />
      <path d="M 32.6 53.5 Q 39.5 52.5 43.2 45.5 Q 37.5 46.5 32.6 53.5" />
      {/* petals */}
      <path d="M 32 18.5 Q 36.2 13.5 32 8 Q 27.8 13.5 32 18.5" />
      <path d="M 35 20.3 Q 41.5 21.4 44.1 15 Q 37.3 14.1 35 20.3" />
      <path d="M 35 23.8 Q 37.3 29.9 44.1 29 Q 41.5 22.6 35 23.8" />
      <path d="M 32 25.5 Q 27.8 30.5 32 36 Q 36.2 30.5 32 25.5" />
      <path d="M 29 23.8 Q 22.5 22.6 19.9 29 Q 26.7 29.9 29 23.8" />
      <path d="M 29 20.3 Q 26.7 14.1 19.9 15 Q 22.5 21.4 29 20.3" />
      {/* centre + base dot */}
      <circle cx="32" cy="22" r="3.2" />
      <circle cx="32" cy="58" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
