import { useQuery } from '@tanstack/react-query';

import { getMyProfile } from '../api/profile.repo';
import { useAuthUser } from '../AuthProvider';
import type { Profile } from '../types';

/** Keyed by user id: two musicians on one tablet must never share a cache entry. */
export const profileKey = (userId: string) => ['auth', 'profile', userId] as const;

/**
 * The signed-in musician's profile.
 *
 * Disabled while signed out, so a sign-out cannot leave a request in flight
 * that resolves into an empty cache a moment later.
 */
export function useMyProfile() {
  const user = useAuthUser();

  return useQuery<Profile | null>({
    queryKey: profileKey(user?.id ?? 'anonymous'),
    queryFn: () => getMyProfile(user?.id as string),
    enabled: Boolean(user),
  });
}
