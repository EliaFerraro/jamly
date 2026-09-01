import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * The Supabase client.
 *
 * IMPORTANT (docs/tech/33-conventions.md): screens and components must NEVER
 * import this module. All data access goes through a feature's repository in
 * `src/features/<feature>/api/`. That boundary is what keeps offline caching,
 * testing and any future backend change tractable instead of a rewrite.
 *
 * Only the ANON key belongs here. It is safe to ship because row-level security
 * is the actual authorization boundary — see docs/tech/32-data-model.md.
 */

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Whether the app is configured to talk to a backend at all.
 *
 * The v0.0 skeleton runs without a Supabase project: it starts, navigates and
 * renders every screen. Features check this before attempting a network call
 * rather than crashing on boot.
 */
export const isBackendConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isBackendConfigured) {
    throw new Error(
      'Supabase is not configured. Copy .env.example to .env and set ' +
        'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  client ??= createClient(url as string, anonKey as string, {
    auth: {
      // Magic-link only (ADR-0002). No password flows to build or support.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}
