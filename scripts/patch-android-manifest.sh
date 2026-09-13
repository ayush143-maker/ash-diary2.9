#!/usr/bin/env bash
# capacitor-voice-recorder does not bundle android.permission.RECORD_AUDIO in
# its own AndroidManifest.xml (confirmed against its own README — it says to
# add this yourself). Since android/ is generated fresh by CI every run and
# never committed, this has to be patched in after `npx cap add android` and
# before `cap sync` / gradle, every time. Idempotent — safe to re-run.
set -euo pipefail

MANIFEST="android/app/src/main/AndroidManifest.xml"
PERMISSION='<uses-permission android:name="android.permission.RECORD_AUDIO" />'

if [ ! -f "$MANIFEST" ]; then
  echo "::error::$MANIFEST not found — did 'npx cap add android' run first?"
  exit 1
fi

if grep -q "android.permission.RECORD_AUDIO" "$MANIFEST"; then
  echo "RECORD_AUDIO already present in $MANIFEST — skipping."
  exit 0
fi

sed -i "s#<application#    ${PERMISSION}\n\n    <application#" "$MANIFEST"

if ! grep -q "android.permission.RECORD_AUDIO" "$MANIFEST"; then
  echo "::error::Failed to insert RECORD_AUDIO permission — <application> tag not found in expected form."
  exit 1
fi

echo "Inserted RECORD_AUDIO permission into $MANIFEST:"
grep -n "RECORD_AUDIO" "$MANIFEST"
