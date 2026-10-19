import { useQuery } from '@tanstack/react-query';

import { useAuthUser } from '@/features/auth';
import { getMyBands } from '../api/band.repo';
import type { BandMembership } from '../types';

/**
 * Keyed by user id, and every band-scoped key from here on starts with the
 * band. Two musicians sharing a tablet must never share a cache entry, and
 * neither must two bands (docs/tech/33-conventions.md).
 */
export const myBandsKey = (userId: string) => ['band', 'mine', userId] as const;

export function useMyBands() {
  const user = useAuthUser();

  return useQuery<BandMembership[]>({
    queryKey: myBandsKey(user?.id ?? 'anonymous'),
    queryFn: () => getMyBands(user?.id as string),
    enabled: Boolean(user),
  });
}

/**
 * The band the app is currently showing.
 *
 * v0.1 shows one band and has no switcher (multi-band is v0.2, F216). That is
 * a navigation decision, not a data one — so this hook has to answer for zero,
 * one and several memberships from the first build, because a musician who
 * creates a band and joins a friend's has two of them immediately.
 *
 * With several, the most recently joined wins. Deterministic, and it matches
 * what someone who just tapped an invite link expects to be looking at.
 */
export function useCurrentBand() {
  const query = useMyBands();
  const memberships = query.data ?? [];

  return {
    ...query,
    membership: memberships[0] ?? null,
    /** Everything they are in. The switcher that will use this is v0.2. */
    memberships,
    hasNoBand: query.isSuccess && memberships.length === 0,
  };
}
