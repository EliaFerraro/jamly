import * as Linking from 'expo-linking';

/**
 * The invite link, and how to read one back.
 *
 * Built with Linking.createURL so the link that gets shared is one this build
 * can actually open — `jamly://join/<code>` in a development or store build.
 * app.json already claims https://jamly.app/join/* for Android, so when that
 * domain exists and serves the universal-links files, this becomes an https
 * URL and nothing above this module changes.
 */

const INVITE_PATH = 'join';

/** What the migration generates: 12 lowercase hex characters. */
const CODE_PATTERN = /^[a-z0-9]{6,64}$/i;

export function buildInviteUrl(code: string): string {
  return Linking.createURL(`${INVITE_PATH}/${encodeURIComponent(code)}`);
}

/**
 * The message that lands in the group chat.
 *
 * The band's name is in it because a bare link from a band leader who forgot
 * to say what it was is a link nobody taps.
 */
export function buildInviteMessage(bandName: string, url: string): string {
  return `Join ${bandName} on Jamly:\n${url}`;
}

/**
 * Pulls a code out of whatever the musician actually had to hand.
 *
 * Accepts the bare code or the whole link, because someone typing this in has
 * already had something go wrong and should not also have to know which part
 * of the URL matters. Returns null when there is nothing usable, so the caller
 * never sends a guess to the server.
 */
export function parseInviteCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withoutQuery = trimmed.split(/[?#]/)[0] ?? '';
  const lastSegment = withoutQuery.split('/').filter(Boolean).pop() ?? '';

  const candidate = decodeURIComponent(lastSegment);
  return CODE_PATTERN.test(candidate) ? candidate : null;
}
