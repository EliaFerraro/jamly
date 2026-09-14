import { useCallback, useEffect, useRef, useState } from 'react';

import { signInWithPassword } from '../api/auth.repo';
import { cooldownMsAfter } from '../attempts';
import { normalizeEmail, validateSignIn, type CredentialProblem } from '../credentials';
import type { AuthFailure } from '../types';

/**
 * The sign-in screen's whole behaviour.
 *
 * On success nothing here navigates: the session change reaches AuthProvider,
 * which flips the route guard. A screen that pushed a route itself would be a
 * second source of truth for "am I signed in", and they would disagree the
 * first time a token expired.
 */
export function useSignIn() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [problem, setProblem] = useState<CredentialProblem | null>(null);
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const consecutiveFailures = useRef(0);

  useEffect(() => {
    if (lockedUntil === 0) return;
    const id = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= lockedUntil) setLockedUntil(0);
    }, 500);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const cooldownRemainingMs = Math.max(0, lockedUntil - now);

  const submit = useCallback(
    async (rawEmail: string, password: string) => {
      if (isSubmitting || Date.now() < lockedUntil) return;

      const email = normalizeEmail(rawEmail);
      const found = validateSignIn(email, password);
      setProblem(found);
      setFailure(null);
      if (found) return;

      setIsSubmitting(true);
      const result = await signInWithPassword(email, password);
      setIsSubmitting(false);

      if (result.ok) {
        consecutiveFailures.current = 0;
        setLockedUntil(0);
        return;
      }

      // Only a rejected password counts as a guess. Being on a train with no
      // signal is not an attack, and treating it as one would lock out the
      // person who most needs to get in.
      if (result.failure.reason === 'invalidCredentials') {
        consecutiveFailures.current += 1;
        const wait = cooldownMsAfter(consecutiveFailures.current);
        if (wait > 0) {
          setLockedUntil(Date.now() + wait);
          setNow(Date.now());
        }
      }

      setFailure(result.failure);
    },
    [isSubmitting, lockedUntil],
  );

  return { submit, isSubmitting, problem, failure, cooldownRemainingMs };
}
