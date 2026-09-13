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
 */
export async function syncDailyReminder(enabled: boolean, time: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.cancel({ notifications: [{ id: DAILY_REMINDER_ID }] });
  if (!enabled) return;

  const [hour, minute] = time.split(':').map(Number);
  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_REMINDER_ID,
        title: 'ASH DIARY',
        body: 'Time to write…',
        schedule: { on: { hour, minute }, allowWhileIdle: true },
      },
    ],
  });
}
