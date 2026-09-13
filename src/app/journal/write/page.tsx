import { Suspense } from "react";
import { JournalWriteClient } from "@/features/journal/JournalWriteClient";

/**
 * Single static-export-safe editor route.
 * /journal/write            -> new entry
 * /journal/write?id=<id>    -> edit existing entry
 *
 * Replaces the old dynamic /journal/[id] route, which cannot be
 * pre-rendered without generateStaticParams and has no place in a
 * Capacitor static export served from local assets.
 */
export default function JournalWritePage() {
  return (
    <Suspense fallback={null}>
      <JournalWriteClient />
    </Suspense>
  );
}
