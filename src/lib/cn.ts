type ClassValue = string | number | boolean | undefined | null;

/**
 * Minimal classname joiner.
 * We avoid adding `clsx` or `tailwind-merge` dependencies in Phase 1
 * to keep the bundle lightweight and dependency-free.
 */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ');
}
