import { isAuthApiError, isAuthRetryableFetchError } from '@supabase/supabase-js';

import type { AuthFailure } from '../types';

/**
 * Turns whatever came back from Supabase into something a musician can act on.
 *
 * Screens receive a state, never an exception (docs/tech/33-conventions.md),
 * and never an error code: "invalid_credentials" is not English, and a person
 * holding a bass in a loading bay has no use for it.
 */

const messages: Record<AuthFailure['reason'], string> = {
  invalidCredentials: "That email and password don't match. Check both and try again.",
  emailNotConfirmed: "This email hasn't been confirmed yet — check your inbox.",
  accountBlocked: 'This account is locked. Get in touch and we will sort it out.',
  tooManyAttempts: 'Too many tries. Give it a minute, then have another go.',
  offline: "Can't reach Jamly — check your connection.",
  backendUnconfigured: 'This build has no backend configured yet.',
  unknown: 'Something went wrong signing in. Try again.',
};

export function authFailure(reason: AuthFailure['reason']): AuthFailure {
  return { reason, message: messages[reason] };
}

/** True for the network shapes that mean "the request never landed". */
function looksOffline(error: unknown): boolean {
  if (isAuthRetryableFetchError(error)) return true;
  return (
    error instanceof Error &&
    /network request failed|fetch failed|failed to fetch|timeout/i.test(error.message)
  );
}

export function toAuthFailure(error: unknown): AuthFailure {
  if (looksOffline(error)) return authFailure('offline');

  if (isAuthApiError(error)) {
    // 429 is the edge rate limiter, which answers before GoTrue does and so
    // does not always carry a code.
    if (error.status === 429 || error.code === 'over_request_rate_limit') {
      return authFailure('tooManyAttempts');
    }

    switch (error.code) {
      case 'invalid_credentials':
      // A missing user is answered exactly like a wrong password on purpose:
      // see the note on AuthFailureReason in ../types.
      case 'user_not_found':
        return authFailure('invalidCredentials');
      case 'email_not_confirmed':
        return authFailure('emailNotConfirmed');
      case 'user_banned':
        return authFailure('accountBlocked');
      default:
        break;
    }

    // Older GoTrue responses carry no code, only this message.
    if (/invalid login credentials/i.test(error.message)) {
      return authFailure('invalidCredentials');
    }
  }

  return authFailure('unknown');
}
