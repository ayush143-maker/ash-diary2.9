import { useCallback, useEffect, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Triggers a save function after the value stops changing for `delayMs`.
 * Returns the current status of the save operation.
 */
export function useAutoSave<T>(
  value: T,
  onSave: (val: T) => Promise<void>,
  delayMs = 800
): AutoSaveStatus {
  const debouncedValue = useDebouncedValue(value, delayMs);
  const [status, setStatus] = useState<AutoSaveStatus>('idle');

  const save = useCallback(async (val: T) => {
    setStatus('saving');
    try {
      await onSave(val);
      setStatus('saved');
      // Reset to idle after a short delay so the UI can show "Saved"
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
    }
  }, [onSave]);

  useEffect(() => {
    // Don't trigger save on the very first render if it's just hydration
    save(debouncedValue);
  }, [debouncedValue, save]);

  return status;
}
