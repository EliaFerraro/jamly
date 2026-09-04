/**
 * The classification here is subtler than it looks and was wrong once already:
 * postgrest-js does not throw when a request never lands, and a rejected key
 * comes back with a null error code — so branching on the code instead of the
 * HTTP status blames the network for what is actually a bad key in .env.
 * These cases pin the three outcomes to the shapes the real API returns.
 */

const mockLimit = jest.fn();

jest.mock('@/lib/supabase', () => ({
  isBackendConfigured: true,
  getSupabase: () => ({
    from: () => ({ select: () => ({ limit: mockLimit }) }),
  }),
}));

import { checkBackend } from '../checkBackend';

beforeEach(() => mockLimit.mockReset());

describe('checkBackend', () => {
  it('treats a missing probe table as healthy — an empty database is not a broken one', async () => {
    mockLimit.mockResolvedValue({
      error: { code: 'PGRST205', message: "Could not find the table 'public.__jamly_health_probe__'" },
      status: 404,
    });

    const result = await checkBackend();

    expect(result.state).toBe('ok');
  });

  it('reports a real select as healthy', async () => {
    mockLimit.mockResolvedValue({ error: null, status: 200 });

    expect((await checkBackend()).state).toBe('ok');
  });

  it('blames the key, not the network, when Supabase rejects the request', async () => {
    // The shape the live API actually returns: 401 with NO error code.
    mockLimit.mockResolvedValue({
      error: { code: null, message: 'Invalid API key' },
      status: 401,
    });

    const result = await checkBackend();

    expect(result.state).toBe('rejected');
  });

  it('reports an unreachable backend when the request never lands', async () => {
    // postgrest-js returns status 0 rather than throwing.
    mockLimit.mockResolvedValue({
      error: { code: '', message: 'TypeError: fetch failed' },
      status: 0,
    });

    const result = await checkBackend();

    expect(result.state).toBe('unreachable');
  });
});
