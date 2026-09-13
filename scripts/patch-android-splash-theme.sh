#!/usr/bin/env bash
# The community @capacitor/splash-screen plugin's default generated
# AppTheme.NoActionBarLaunch only sets legacy `android:background`.
# That attribute is NOT read by AndroidX core-splashscreen's
# Theme.SplashScreen on real devices — without the
# windowSplashScreenBackground / windowSplashScreenAnimatedIcon items,
# the OS falls back to its own default: the adaptive launcher icon
# (ivory squircle chip) on a dark backdrop, instead of our full-bleed
# ivory splash.png.
#
# windowSplashScreenAnimatedIcon must NOT point at @mipmap/ic_launcher_foreground:
# @capacitor/assets generates that mipmap at legacy launcher-icon pixel
# sizes (max 192x192 at xxxhdpi), not the full adaptive-icon resolution.
# The OS scales whatever it's given up into its ~240dp splash icon slot
# (960px+ on a 4x-density screen) — a 192px source stretched that far
# is why the mark rendered soft/blurry. Instead we copy our real
# 1024x1024 transparent source straight into drawable-nodpi (untouched
# by any density-bucket resizing), so the OS is always downscaling from
# a large source, never upscaling from a small one.
#
# android/ is generated fresh by CI every run and never committed, so
# this has to be patched in after `npx cap add android` and before
# `cap sync` / gradle, every time. Idempotent — safe to re-run.
set -euo pipefail

STYLES="android/app/src/main/res/values/styles.xml"
SOURCE_ICON="assets/icon-foreground.png"
DEST_DIR="android/app/src/main/res/drawable-nodpi"
DEST_ICON="$DEST_DIR/splash_icon.png"

if [ ! -f "$STYLES" ]; then
  echo "::error::$STYLES not found — did 'npx cap add android' run first?"
  exit 1
fi

if [ ! -f "$SOURCE_ICON" ]; then
  echo "::error::$SOURCE_ICON not found."
  exit 1
fi

mkdir -p "$DEST_DIR"
cp "$SOURCE_ICON" "$DEST_ICON"
echo "Copied $SOURCE_ICON -> $DEST_ICON"

if grep -q "windowSplashScreenBackground" "$STYLES"; then
  echo "windowSplashScreenBackground already present in $STYLES — skipping theme edit."
  exit 0
fi

python3 - "$STYLES" << 'PYEOF'
import sys
path = sys.argv[1]
old = '''    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">@drawable/splash</item>
    </style>'''
new = '''    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">@drawable/splash</item>
        <item name="windowSplashScreenBackground">#F7F9F0</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/splash_icon</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>'''
with open(path) as f:
    content = f.read()
if old not in content:
    print("::error::exact style block text not found for replacement", file=sys.stderr)
    sys.exit(1)
content = content.replace(old, new, 1)
with open(path, 'w') as f:
    f.write(content)
PYEOF

if ! grep -q "windowSplashScreenBackground" "$STYLES"; then
  echo "::error::Failed to insert windowSplashScreen items into $STYLES."
  exit 1
fi

echo "Patched AppTheme.NoActionBarLaunch in $STYLES:"
grep -n "windowSplashScreen\|postSplashScreenTheme" "$STYLES"
