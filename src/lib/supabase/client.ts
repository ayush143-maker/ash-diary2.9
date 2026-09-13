import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null | undefined;

/**
 * Returns the Supabase client, or null if NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY aren't set. These are inlined at BUILD
 * time (static export), so they must be present as env vars during
 * `npm run build` in CI — not just set somewhere in the dashboard.
 * Every caller must handle null and fall back to local-only behavior.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    client = null;
    return client;
  }

  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

/**
 * Ensures an anonymous session exists and returns the user id.
 * Returns null if Supabase isn't configured, anonymous sign-ins aren't
 * enabled in the dashboard, or the device is offline — callers treat
 * null as "stay local for now," never as a thrown error.
 */
export async function ensureAnonymousSession(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user) return sessionData.session.user.id;

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.session) {
      console.error('Supabase anonymous sign-in failed:', error?.message);
      return null;
    }
    return data.session.user.id;
  } catch (err) {
    console.error('Supabase session check failed:', err);
    return null;
  }
}
