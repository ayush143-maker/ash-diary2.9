# ASH DIARY

A private, calm, mobile-first journal. Designed for a 390×844 phone
viewport first — intimate, minimal, slightly cinematic. Not a dashboard.

## Stack

- Next.js 15 (App Router, static export) · React 19 · TypeScript (strict)
- Tailwind CSS v4 with CSS-variable design tokens (dark-first)
- Capacitor 8 (Android) for the native wrapper
- Supabase (Postgres + Auth + Storage) for optional cloud backup

## Cloud backup setup

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are inlined at
**build time** (this is a static export — there's no server to read them at
runtime), so they must reach the `npm run build` step in CI, not just exist
somewhere in the repo settings. The workflow reads them from either GitHub
Actions **secrets** or **variables** (whichever you used), so either works:

```yaml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL || vars.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY || vars.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

Anonymous Sign-ins must also be turned on in the Supabase dashboard
(Authentication → Sign In / Providers) — without it, every upload attempt
fails at the session step and the app just stays local, by design.

If either the env vars or anonymous auth aren't available, `getCloudProvider()`
falls back to the Phase 1 local stub automatically — the app never crashes,
"Upload to Cloud" just won't do anything real yet.



```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # strict TS check
npm run lint
```

The web preview runs the same UI with browser-fallback implementations
of the recorder (`MediaRecorder`) and no scheduled notifications —
those only activate on a native (Capacitor) build.

## Get the APK

No local Android SDK needed. The APK is built entirely by CI:

1. Push to `main`, or open the **Actions** tab → **Android APK** →
   **Run workflow** for an on-demand build.
2. Once the run finishes, open it and download the **ash-diary-debug-apk**
   artifact from the bottom of the run summary.
3. Unzip it, copy `app-debug.apk` to your device, and install it
   (you'll need to allow installs from your file manager the first time).

The workflow does **not** commit `android/` — CI creates it fresh each
run via `npx cap add android`, then regenerates every icon and splash
screen from `assets/icon.png` before syncing and building.

## Updating the app icon

Replace `assets/icon.png` (a large, roughly-square PNG — the current one
is 1254×1254) and push. The next CI run regenerates every Android
mipmap, adaptive-icon layer, and splash screen from it automatically via
`@capacitor/assets` — nothing is hand-edited. The workflow fails loudly
if `assets/icon.png` is missing. `public/app-icon.png` is a separate copy
used for the web favicon/PWA metadata and needs to be updated by hand to
match.

## Native plugins

| Plugin | Package | Why |
|---|---|---|
| Filesystem | `@capacitor/filesystem` | Persists recorded audio to on-device storage |
| Voice recording | `capacitor-voice-recorder` | Original, most-forked, actively maintained recorder plugin. `@capacitor/voice-recorder` and `@capacitor-community/voice-recorder` do not exist as published packages — don't reintroduce either name. It does **not** bundle `RECORD_AUDIO` in its own manifest (its own docs say to add it yourself) — `scripts/patch-android-manifest.sh` does this in CI since `android/` isn't committed |
| Reminders | `@capacitor/local-notifications` | Schedules the daily "Time to write…" notification |
| Icons/splash | `@capacitor/assets` (dev-only) | Generates native assets from `assets/icon.png` in CI |

App lock / biometrics was removed from this build (see below) — the
"App lock" toggle in Settings is now disabled and inert.

## Permissions & rationale

Every native permission is preceded by a calm, in-app bottom sheet
(`PermissionSheet`) before the OS dialog appears — never a surprise
prompt:

- **Microphone** — requested only when you tap the record button, to
  save a voice memory locally.
- **Notifications** — requested only when you turn on "Daily reminder"
  in Settings → General.
If a permission is denied, the app degrades to a plain inline message —
it never crashes or dead-ends the user.

## Offline-first

`LocalCloudProvider` remains the default and fallback. Supabase sync is
additive: entries and voice memories always save to the device first;
cloud backup happens opportunistically and the app is fully usable with
no network at all.

## App lock (removed)

Biometric app lock (`@aparajita/capacitor-biometric-auth`) was wired in
and then removed at your request. The "App lock" toggle in Settings →
Privacy is now disabled with a "not available in this build" label
rather than deleted outright, so the UI doesn't shift and the setting
key survives if this gets revisited later. No biometric code, gate, or
dependency remains in the tree.
