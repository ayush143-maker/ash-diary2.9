import { useEffect, useState } from 'react';

/**
 * Returns the current timestamp, ticking at the specified interval.
 * Useful for relative time displays ("just now", "2m ago") and recording timers.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
