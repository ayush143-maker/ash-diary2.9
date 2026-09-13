'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { IconSparkles } from '../icons';

type ImageStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface ImageFrameProps {
  /** Path to an image under /public — e.g. IMAGE_PATHS.profile ('/images/profile.png') */
  src?: string;
  alt?: string;
  caption?: string;
  /** Tailwind aspect class for the frame shape. Default: portrait 4:5. */
  aspectClassName?: string;
  /** Polaroid-style treatment: slight rotation + a thicker bottom edge, like a printed photo card. */
  tilt?: boolean;
  className?: string;
}

/**
 * The personal photo frame for the ME tab.
 *
 * Reads images from /public/images (your future image folder). When no
 * image exists yet — or it fails to load — an intentional, calm placeholder
 * is shown. No external URLs are ever used.
 */
export function ImageFrame({
  src,
  alt = 'Personal memory',
  caption,
  aspectClassName = 'aspect-[4/3]',
  tilt = false,
  className,
}: ImageFrameProps) {
  const [status, setStatus] = useState<ImageStatus>(src ? 'loading' : 'idle');

  const showImage = Boolean(src) && status !== 'error';

  return (
    <figure className={cn('group relative', tilt && '-rotate-[1.5deg]', className)}>
      <div
        className={cn(
          'border-line bg-surface relative overflow-hidden rounded-card border',
          tilt && 'p-2 pb-6',
          aspectClassName
        )}
      >
        <div className={cn('relative h-full w-full overflow-hidden', tilt && 'rounded-[6px]')}>
          {showImage ? (
            <img
              src={src}
              alt={alt}
              loading="lazy"
              onLoad={() => setStatus('loaded')}
              onError={() => setStatus('error')}
              className={cn(
                'h-full w-full object-cover transition-opacity duration-700',
                status === 'loaded' ? 'opacity-100' : 'opacity-0'
              )}
            />
          ) : (
            <FramePlaceholder />
          )}

          {/* Cinematic grade — very subtle, never glassy */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5"
          />
          {/* Inner hairline highlight */}
          <div
            aria-hidden="true"
            className="ring-line pointer-events-none absolute inset-0 ring-1 ring-inset"
          />
        </div>
      </div>

      {caption && (
        <figcaption
          className={cn(
            'text-ink-3 mt-2.5 px-1 text-xs tracking-wide',
            tilt && 'text-center'
          )}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function FramePlaceholder() {
  return (
    <div className="from-surface-2 to-surface-3 absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b">
      {/* Ember glow */}
      <div
        aria-hidden="true"
        className="bg-ember absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07] blur-3xl"
      />
      <div className="border-line bg-surface/60 relative flex h-14 w-14 items-center justify-center rounded-full border">
        <IconSparkles size={22} className="text-ember" />
      </div>
      <p className="text-ink-2 relative mt-4 text-sm font-medium">Your memory lives here</p>
      <p className="text-ink-3 relative mt-1 px-8 text-center text-xs leading-relaxed">
        Add personal images to <span className="tnum">/public/images</span>
      </p>
    </div>
  );
}
