import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Where the Supabase session lives on this device.
 *
 * A session is a bearer credential: whoever holds the refresh token is the
 * user until it is revoked. On a phone that gets left on an amp between sets,
 * that belongs in the OS keystore (iOS Keychain / Android EncryptedSharedPrefs)
 * and nowhere else — never in AsyncStorage, which is a plaintext file any
 * backup or rooted device reads.
 *
 * The complication is size. SecureStore documents a 2048-byte ceiling per
 * value on Android, and a Supabase session — access JWT + refresh token + the
 * whole user object — routinely exceeds it. The value is therefore split
 * across numbered entries with a small index, so the ceiling stops being a
 * cliff the app falls off the first time a user has a long display name.
 */

/** Comfortably under SecureStore's documented 2048-byte Android limit. */
const MAX_CHARS_PER_CHUNK = 1800;

/** The subset of expo-secure-store this adapter needs. Injected, so it is testable. */
export type SecureStoreBackend = {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
};

/**
 * What supabase-js asks of a storage medium. Declared here rather than imported
 * so this module stays a generic key-value store with no auth knowledge.
 */
export type SessionStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

/**
 * The index record, written last and read first.
 *
 * `length` is what makes a torn write detectable: if the process died between
 * chunks — or a chunk was evicted — the pieces reassemble to the wrong size and
 * the session is discarded rather than handed to the auth client as garbage.
 */
type ChunkIndex = { chunks: number; length: number };

const chunkKey = (key: string, index: number) => `${key}.${index}`;

function parseIndex(raw: string | null): ChunkIndex | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as ChunkIndex).chunks === 'number' &&
      typeof (parsed as ChunkIndex).length === 'number'
    ) {
      return parsed as ChunkIndex;
    }
  } catch {
    // A value written by something other than this adapter. Treated as absent.
  }
  return null;
}

/** Splits into chunks of at most `size` characters. An empty value is one empty chunk. */
function split(value: string, size: number): string[] {
  if (value.length === 0) return [''];
  const parts: string[] = [];
  for (let i = 0; i < value.length; i += size) {
    parts.push(value.slice(i, i + size));
  }
  return parts;
}

export function createChunkedSecureStorage(
  backend: SecureStoreBackend,
  maxChars: number = MAX_CHARS_PER_CHUNK,
): SessionStorage {
  async function deleteChunks(key: string, from: number, to: number): Promise<void> {
    for (let i = from; i < to; i += 1) {
      await backend.deleteItemAsync(chunkKey(key, i));
    }
  }

  return {
    async getItem(key) {
      // A read must never throw: a device with a locked or unavailable keychain
      // should present a sign-in screen, not a crash on boot.
      try {
        const index = parseIndex(await backend.getItemAsync(key));
        if (!index) return null;

        const parts: string[] = [];
        for (let i = 0; i < index.chunks; i += 1) {
          const part = await backend.getItemAsync(chunkKey(key, i));
          if (part === null) return null;
          parts.push(part);
        }

        const encoded = parts.join('');
        if (encoded.length !== index.length) return null;

        return decodeURIComponent(encoded);
      } catch {
        return null;
      }
    },

    async setItem(key, value) {
      // Percent-encoding guarantees one character is one byte, so chunking by
      // character length is chunking by byte length. Without it a display name
      // in Japanese would silently push a chunk over the Android limit.
      const encoded = encodeURIComponent(value);
      const parts = split(encoded, maxChars);
      const previous = parseIndex(await backend.getItemAsync(key));

      for (let i = 0; i < parts.length; i += 1) {
        await backend.setItemAsync(chunkKey(key, i), parts[i] as string);
      }

      // The index is written last: until it lands, a reader sees the old
      // session or none, never a half-written one.
      const index: ChunkIndex = { chunks: parts.length, length: encoded.length };
      await backend.setItemAsync(key, JSON.stringify(index));

      // A shorter session than last time leaves orphans behind. They are dead
      // credentials in the keystore, so they go.
      if (previous && previous.chunks > parts.length) {
        await deleteChunks(key, parts.length, previous.chunks);
      }
    },

    async removeItem(key) {
      const index = parseIndex(await backend.getItemAsync(key));
      // The index goes first: after this the session is gone even if the
      // process dies mid-cleanup.
      await backend.deleteItemAsync(key);
      if (index) await deleteChunks(key, 0, index.chunks);
    },
  };
}

/**
 * Web fallback. `expo-secure-store` has no web implementation — there is no
 * browser equivalent of a hardware keystore — so the session lives in
 * localStorage, exactly as it does for every other web app. Web is a later
 * target (docs/product/12-roadmap.md); this exists so `expo start --web` runs.
 */
function createLocalStorage(): SessionStorage {
  return {
    async getItem(key) {
      try {
        return globalThis.localStorage?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    async setItem(key, value) {
      globalThis.localStorage?.setItem(key, value);
    },
    async removeItem(key) {
      globalThis.localStorage?.removeItem(key);
    },
  };
}

/** Last resort: a session that lasts as long as the process. Used only in tests. */
function createMemoryStorage(): SessionStorage {
  const map = new Map<string, string>();
  return {
    async getItem(key) {
      return map.get(key) ?? null;
    },
    async setItem(key, value) {
      map.set(key, value);
    },
    async removeItem(key) {
      map.delete(key);
    },
  };
}

export function createSessionStorage(): SessionStorage {
  if (Platform.OS === 'web') {
    return typeof globalThis.localStorage === 'undefined'
      ? createMemoryStorage()
      : createLocalStorage();
  }
  return createChunkedSecureStorage(SecureStore);
}
