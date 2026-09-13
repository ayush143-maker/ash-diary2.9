import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const DAILY_REMINDER_ID = 8801;

/** Requests the OS notification permission. No-op (returns true) on web. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  try {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  } catch {
    return false;
  }
}

/**
 * Schedules (or cancels) the single daily reminder notification.
 * Always cancels the previous one first so changing the time or turning
 * the toggle off never leaves a stale schedule behind.
 *
 * FIXES over the old version:
 * 1. `every: 'day'` was missing — `on:` alone is a ONE-TIME trigger in the
 *    Capacitor plugin, so the "daily" reminder fired at most once ever.
 * 2. A one-time `on:` trigger computed for a time that already passed
 *    today was silently discarded by Android (the 8 PM-set-at-night bug).
 *    A repeating daily schedule always resolves to a future trigger.
 * 3. schedule() rejections (Android 12+ exact-alarm restrictions, Doze,
 *    channel issues) were unhandled — the toggle stayed ON while nothing
 *    was actually registered with the OS. Now everything is caught, the
 *    result is verified via getPending(), and callers get a boolean so
 *    the UI can speak up instead of failing silently.
 */
export async function syncDailyReminder(
  enabled: boolean,
  time: string
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;

  try {
    await LocalNotifications.cancel({ notifications: [{ id: DAILY_REMINDER_ID }] });
    if (!enabled) return true;

    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') return false;

    const [hour = 21, minute = 0] = time.split(':').map(Number);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: DAILY_REMINDER_ID,
          title: 'ASH DIARY',
          body: 'Time to write…',
          schedule: {
            every: 'day',
            on: { hour, minute },
            allowWhileIdle: true,
          },
        },
      ],
    });

    // Verify the alarm actually landed in the OS.
    const { notifications: pending } = await LocalNotifications.getPending();
    return pending.some((n) => n.id === DAILY_REMINDER_ID);
  } catch (err) {
    console.error('Failed to sync daily reminder:', err);
    return false;
  }
}
