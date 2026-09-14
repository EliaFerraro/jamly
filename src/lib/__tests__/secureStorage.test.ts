/**
 * The chunking exists for one reason: a Supabase session is bigger than the
 * 2048 bytes SecureStore promises to store on Android. These cases pin the
 * failure modes that a naive split would get wrong — multi-byte characters
 * pushing a chunk over the byte limit, and a torn write coming back as a
 * plausible-looking but corrupt session.
 */

import { createChunkedSecureStorage, type SecureStoreBackend } from '../secureStorage';

/** SecureStore's documented per-value ceiling on Android. */
const ANDROID_LIMIT_BYTES = 2048;

function fakeBackend() {
  const store = new Map<string, string>();
  const backend: SecureStoreBackend = {
    getItemAsync: async (key) => store.get(key) ?? null,
    setItemAsync: async (key, value) => void store.set(key, value),
    deleteItemAsync: async (key) => void store.delete(key),
  };
  return { store, backend };
}

const byteLength = (value: string) => new TextEncoder().encode(value).length;

describe('chunked secure storage', () => {
  it('round-trips a value far larger than SecureStore accepts', async () => {
    const { backend } = fakeBackend();
    const storage = createChunkedSecureStorage(backend);
    const session = JSON.stringify({ access_token: 'a'.repeat(9000), refresh_token: 'r' });

    await storage.setItem('sb-auth', session);

    expect(await storage.getItem('sb-auth')).toBe(session);
  });

  it('keeps every stored entry under the Android byte limit, even for non-ASCII', async () => {
    const { store, backend } = fakeBackend();
    const storage = createChunkedSecureStorage(backend);

    // A display name in Japanese is three bytes per character: splitting by
    // character count alone would put ~5400 bytes in a "1800-character" chunk.
    await storage.setItem('sb-auth', JSON.stringify({ name: 'あ'.repeat(4000) }));

    for (const value of store.values()) {
      expect(byteLength(value)).toBeLessThanOrEqual(ANDROID_LIMIT_BYTES);
    }
  });

  it('returns unicode content unchanged', async () => {
    const { backend } = fakeBackend();
    const storage = createChunkedSecureStorage(backend);
    const value = JSON.stringify({ name: 'Måns Ólafsdóttir 🥁', note: '100% + &=?/' });

    await storage.setItem('sb-auth', value);

    expect(await storage.getItem('sb-auth')).toBe(value);
  });

  it('discards a torn write rather than handing back half a session', async () => {
    const { store, backend } = fakeBackend();
    const storage = createChunkedSecureStorage(backend);
    await storage.setItem('sb-auth', 'x'.repeat(5000));

    // The keystore lost a chunk — an interrupted write, or an OS eviction.
    store.delete('sb-auth.1');

    expect(await storage.getItem('sb-auth')).toBeNull();
  });

  it('discards a truncated chunk rather than trusting the length', async () => {
    const { store, backend } = fakeBackend();
    const storage = createChunkedSecureStorage(backend);
    await storage.setItem('sb-auth', 'x'.repeat(5000));

    store.set('sb-auth.0', 'x');

    expect(await storage.getItem('sb-auth')).toBeNull();
  });

  it('leaves no orphaned chunks when a shorter session replaces a longer one', async () => {
    const { store, backend } = fakeBackend();
    const storage = createChunkedSecureStorage(backend);

    await storage.setItem('sb-auth', 'x'.repeat(9000));
    await storage.setItem('sb-auth', 'short');

    // Orphans would be readable, still-valid refresh tokens left in the keystore.
    expect([...store.keys()].sort()).toEqual(['sb-auth', 'sb-auth.0']);
    expect(await storage.getItem('sb-auth')).toBe('short');
  });

  it('erases everything on sign-out', async () => {
    const { store, backend } = fakeBackend();
    const storage = createChunkedSecureStorage(backend);
    await storage.setItem('sb-auth', 'x'.repeat(9000));

    await storage.removeItem('sb-auth');

    expect(store.size).toBe(0);
    expect(await storage.getItem('sb-auth')).toBeNull();
  });

  it('reports no session rather than throwing when the keystore is unavailable', async () => {
    const storage = createChunkedSecureStorage({
      getItemAsync: async () => {
        throw new Error('Could not decrypt the value for key');
      },
      setItemAsync: async () => {},
      deleteItemAsync: async () => {},
    });

    await expect(storage.getItem('sb-auth')).resolves.toBeNull();
  });

  it('ignores a value it did not write', async () => {
    const { store, backend } = fakeBackend();
    const storage = createChunkedSecureStorage(backend);
    store.set('sb-auth', 'not-json-written-by-someone-else');

    expect(await storage.getItem('sb-auth')).toBeNull();
  });
});
