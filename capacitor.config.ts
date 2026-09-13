import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ashdiary.app',
  appName: 'ASH DIARY',
  webDir: 'out',
  backgroundColor: '#F7F9F0',
  plugins: {
    /**
     * Native edge-to-edge support (Capacitor 8.3.0+): insetsHandling
     * defaults to 'css', which is what makes --safe-area-inset-* work
     * correctly in globals.css — no extra config needed for that part.
     * style: 'DARK' gives dark status & nav bar icons, correct for our
     * light cream canvas (flipped from 'LIGHT' when the app was dark).
     */
    SystemBars: {
      style: 'DARK',
    },
    /**
     * Without this plugin present, Android 12+ shows its own OS-default
     * splash (icon + the stock Capacitor template's background color,
     * not ours) since nothing native is wired to read our configured
     * color at all — confirmed as the cause of the green screen behind
     * the launcher icon. This plugin is what makes `assets generate
     * --splashBackgroundColor` actually apply to what's shown.
     */
    SplashScreen: {
      backgroundColor: '#F7F9F0',
      androidSplashResourceName: 'splash',
      /**
       * CENTER_INSIDE, not CENTER_CROP: assets/splash.png now has real
       * artwork (the transparent "a" mark) instead of a flat fallback
       * color, so cropping is no longer harmless. Because the image's
       * own background (#F7F9F0) exactly matches this backgroundColor,
       * CENTER_INSIDE letterboxes with zero visible seam on any aspect
       * ratio (tall phones, foldables, tablets) while guaranteeing the
       * mark itself is never clipped.
       */
      androidScaleType: 'CENTER_INSIDE',
      showSpinner: false,
      launchAutoHide: true,
      launchShowDuration: 0,
    },
  },
};

export default config;
