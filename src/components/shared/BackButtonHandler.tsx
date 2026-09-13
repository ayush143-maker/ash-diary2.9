'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * Capacitor does NOT automatically wire the Android hardware/gesture back
 * button to in-app navigation — without this listener, the default
 * Activity behavior on back is to finish() the Activity, i.e. exit the
 * app entirely, even when the app has its own screen history to go back
 * through. This was the cause of "back gesture closes the whole app"
 * from the editor. @capacitor/app's canGoBack reflects the WebView's own
 * navigation stack; only exit at true root (the Me tab).
 */
export function BackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        router.back();
      } else if (pathname === '/') {
        App.exitApp();
      } else {
        router.push('/');
      }
    });

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, [router, pathname]);

  return null;
}
