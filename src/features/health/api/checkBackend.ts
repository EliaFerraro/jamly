import { getSupabase, isBackendConfigured } from '@/lib/supabase';

/**
 * A table that deliberately does not exist.
 *
 * The database has no tables yet, so there is nothing legitimate to select
 * from. Asking for a table that is absent is still a complete round trip:
 * Supabase's gateway authenticates the key, PostgREST receives the request and
 * answers out of a schema cache it can only have built by reading Postgres.
 * The resulting `PGRST205` is therefore proof the backend is healthy, not a
 * failure — a missing table and a missing database look nothing alike.
 */
const PROBE_TABLE = '__jamly_health_probe__';

/** Postgres' own "relation does not exist", in case PostgREST passes it through. */
const UNDEFINED_TABLE = '42P01';
const SCHEMA_CACHE_MISS = 'PGRST205';

export type BackendStatus =
  /** No URL/key in the environment. The app runs; it just has no backend. */
  | { state: 'unconfigured' }
  /** Round trip completed: gateway, key and database all answered. */
  | { state: 'ok'; latencyMs: number; detail: string }
  /** Reached Supabase, which refused us — almost always a wrong or stale key. */
  | { state: 'rejected'; detail: string }
  /** Never got an answer: no network, DNS, or a paused/deleted project. */
  | { state: 'unreachable'; detail: string };

export async function checkBackend(): Promise<BackendStatus> {
  if (!isBackendConfigured) {
    return { state: 'unconfigured' };
  }

  const startedAt = Date.now();

  try {
    const { error, status } = await getSupabase()
      .from(PROBE_TABLE)
      .select('*')
      .limit(1);
    const latencyMs = Date.now() - startedAt;

    if (!error) {
      // Someone actually created the probe table. Still a healthy round trip.
      return { state: 'ok', latencyMs, detail: 'Database responded.' };
    }

    // The HTTP status is the only trustworthy signal here. postgrest-js does
    // not throw when a request never lands — it returns a normal-looking error
    // — and a rejected key reports no error code at all, so branching on the
    // code alone would blame the network for what is really a bad key.
    if (status === 0) {
      return {
        state: 'unreachable',
        detail: error.message || 'No response from Supabase.',
      };
    }

    if (status === 401 || status === 403) {
      return { state: 'rejected', detail: error.message || 'Invalid API key.' };
    }

    if (error.code === SCHEMA_CACHE_MISS || error.code === UNDEFINED_TABLE) {
      return {
        state: 'ok',
        latencyMs,
        detail: 'Database responded. No tables yet — that is expected.',
      };
    }

    return {
      state: 'rejected',
      detail: error.message || `Supabase answered ${status}.`,
    };
  } catch (cause) {
    // Belt and braces: postgrest-js is not expected to throw, but a malformed
    // URL fails before the request is ever built.
    return {
      state: 'unreachable',
      detail: cause instanceof Error ? cause.message : 'No response from Supabase.',
    };
  }
}
