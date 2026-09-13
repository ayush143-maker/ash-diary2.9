import React from 'react';
import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "bg-surface-3 rounded-control animate-shimmer",
        "bg-[linear-gradient(90deg,var(--surface-3)_0%,var(--surface-2)_50%,var(--surface-3)_100%)]",
        "bg-[length:200%_100%]",
        className
      )} 
    />
  );
}
