/**
 * Credential handling, kept pure so it can be tested without a backend.
 */

/**
 * bcrypt — what Supabase Auth hashes with — silently ignores everything past
 * 72 bytes. A passphrase longer than that would appear to work while a
 * truncated prefix was the real password, so the limit is stated rather than
 * discovered.
 */
export const PASSWORD_MAX_BYTES = 72;

/**
 * Lowercased and trimmed before it leaves the device.
 *
 * GoTrue stores addresses lowercased, so `Marco@Band.it` and `marco@band.it`
 * are one account. Normalising here means the phone keyboard's automatic
 * capitalisation cannot produce a "wrong password" that is really a wrong
 * address, and that a trailing space pasted from a chat message is harmless.
 */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * A deliberately loose check: one @, something either side, a dot in the
 * domain. Anything stricter rejects real addresses, and the only authority on
 * whether an address exists is the server.
 */
export function isPlausibleEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** UTF-8 byte length, without assuming a TextEncoder exists in the JS engine. */
export function utf8ByteLength(value: string): number {
  let bytes = 0;
  for (const character of value) {
    const code = character.codePointAt(0) as number;
    if (code <= 0x7f) bytes += 1;
    else if (code <= 0x7ff) bytes += 2;
    else if (code <= 0xffff) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

/** Which field a problem belongs to, so the form can point at it. */
export type CredentialProblem = {
  field: 'email' | 'password';
  message: string;
};

/**
 * What is worth checking before spending a network round trip.
 *
 * Note what is NOT checked: password strength. A minimum length on a *sign-in*
 * field locks out the person whose password predates the rule, and tells an
 * attacker the shape of every password in the system. Strength belongs where a
 * password is chosen, and that is the server's job (Supabase Auth → Policies).
 */
export function validateSignIn(email: string, password: string): CredentialProblem | null {
  if (email.length === 0) {
    return { field: 'email', message: 'Enter your email address.' };
  }
  if (!isPlausibleEmail(email)) {
    return { field: 'email', message: "That doesn't look like an email address." };
  }
  if (password.length === 0) {
    return { field: 'password', message: 'Enter your password.' };
  }
  return null;
}
