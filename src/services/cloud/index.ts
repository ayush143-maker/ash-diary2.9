import { LocalCloudProvider } from './LocalCloudProvider';
import { SupabaseCloudProvider } from './SupabaseCloudProvider';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { CloudProvider } from './types';

let provider: CloudProvider | null = null;

/**
 * Real backend when NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are present at
 * build time; otherwise LocalCloudProvider (Phase 1's stub), so the app
 * never crashes on a build that hasn't set those up yet. Offline-first
 * is still preserved: this only runs on an explicit "Upload to Cloud"
 * tap, and local storage stays the source of truth either way.
 */
export function getCloudProvider(): CloudProvider {
  if (!provider) {
    provider = getSupabaseClient() ? new SupabaseCloudProvider() : new LocalCloudProvider();
  }
  return provider;
}

/** For CloudScreen to know which provider is actually active, for real copy instead of a guess. */
export function isCloudConfigured(): boolean {
  return Boolean(getSupabaseClient());
}
