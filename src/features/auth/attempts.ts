/**
 * Client-side back-off between failed sign-ins.
 *
 * Supabase rate-limits at the edge, and that is the control that actually
 * matters — this one runs on the attacker's own device and can be removed with
 * a debugger. It exists for the two things it *can* do: stop a stolen phone
 * being used to grind through guesses at full speed, and stop a genuine user
 * who has forgotten which password they used from tripping the server-side
 * limit, which would lock them out far harder and for longer.
 */

/** Attempts before the brakes come on. Generous: fat fingers on a dark stage. */
export const ATTEMPTS_BEFORE_COOLDOWN = 5;

const FIRST_COOLDOWN_MS = 15_000;
const MAX_COOLDOWN_MS = 5 * 60_000;

/** How long to wait after `failures` consecutive failed attempts. */
export function cooldownMsAfter(failures: number): number {
  if (failures < ATTEMPTS_BEFORE_COOLDOWN) return 0;
  const doublings = failures - ATTEMPTS_BEFORE_COOLDOWN;
  return Math.min(FIRST_COOLDOWN_MS * 2 ** doublings, MAX_COOLDOWN_MS);
}

/** "45 seconds" / "1 minute" — a wait is stated in words, never as a timestamp. */
export function formatWait(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}
