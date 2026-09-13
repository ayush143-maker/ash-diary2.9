import React from 'react';

/** Tiny deterministic PRNG (mulberry32) — same seed always gives the same sprig. */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turns any string (an entry or voice memory id) into a stable numeric seed. */
function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return h;
}

function leafPath(cx: number, cy: number, angleDeg: number, length: number, width: number): string {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const px = -dy;
  const py = dx;
  const tipX = cx + dx * length;
  const tipY = cy + dy * length;
  const baseX = cx - dx * length * 0.15;
  const baseY = cy - dy * length * 0.15;
  const c1x = baseX + px * width;
  const c1y = baseY + py * width;
  const c3x = cx - px * width * 0.6 + dx * length * 0.5;
  const c3y = cy - py * width * 0.6 + dy * length * 0.5;
  return `M ${baseX.toFixed(1)} ${baseY.toFixed(1)} Q ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} Q ${c3x.toFixed(1)} ${c3y.toFixed(1)} ${baseX.toFixed(1)} ${baseY.toFixed(1)}`;
}

interface SprigProps {
  /** Any stable string — an entry id, voice memory id, mood name, etc. */
  seed: string;
  size?: number;
  className?: string;
}

/**
 * A small, deterministic botanical line-art sprig — decorative accent for
 * journal entries and voice memories, replacing the "images" a written
 * journal doesn't otherwise have. Same seed always renders the same
 * sprig, so a given entry keeps its own "look," but different entries
 * naturally vary (leaf count, lean, size) instead of repeating one
 * static icon everywhere.
 */
export function Sprig({ seed, size = 32, className }: SprigProps) {
  const rnd = mulberry32(hashSeed(seed));
  const leafCount = 3 + Math.floor(rnd() * 2); // 3-4 — fuller, fewer leaves reads better than many thin ones
  const lean = (rnd() - 0.5) * 1.4; // -0.7..0.7
  const widthRatio = 0.55 + rnd() * 0.12; // fuller, rounder leaves

  const x0 = 32;
  const y0 = 58;
  const x1 = 32 + lean * 10;
  const y1 = 6;
  const ctrlX = 32 + lean * 14;
  const ctrlY = 32;
  const stem = `M ${x0} ${y0} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;

  const leaves: string[] = [];
  for (let i = 0; i < leafCount; i++) {
    const t = (i + 1) / (leafCount + 1);
    const mt = 1 - t;
    const x = mt * mt * x0 + 2 * mt * t * ctrlX + t * t * x1;
    const y = mt * mt * y0 + 2 * mt * t * ctrlY + t * t * y1;
    const tx = 2 * mt * (ctrlX - x0) + 2 * t * (x1 - ctrlX);
    const ty = 2 * mt * (ctrlY - y0) + 2 * t * (y1 - ctrlY);
    const tangentAngle = (Math.atan2(ty, tx) * 180) / Math.PI;
    const side = i % 2 === 0 ? 1 : -1;
    const leafAngle = tangentAngle + side * 58 + (rnd() - 0.5) * 10;
    const leafSize = (12 + rnd() * 3) * (1 - t * 0.25);
    leaves.push(leafPath(x, y, leafAngle, leafSize, leafSize * widthRatio));
  }

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
      <path d={stem} />
      {leaves.map((d, i) => (
        <path key={i} d={d} />
      ))}
      <circle cx={x0} cy={y0} r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
