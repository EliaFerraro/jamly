/**
 * Duration helpers for setlists.
 *
 * A setlist's running time is the number the band leader actually cares about
 * ("do we have 90 minutes of material?"), so it gets real tests.
 */

/** Format seconds as m:ss, or h:mm:ss past an hour. */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '—';

  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/**
 * Total running time of a set. Items without a duration contribute nothing —
 * a missing duration must never make the total disappear.
 */
export function totalDuration(items: { durationSeconds?: number | null }[]): number {
  return items.reduce((sum, item) => sum + (item.durationSeconds ?? 0), 0);
}
