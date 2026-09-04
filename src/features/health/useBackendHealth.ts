import { useQuery } from '@tanstack/react-query';

import { checkBackend, type BackendStatus } from './api/checkBackend';

export const backendHealthKey = ['health', 'backend'] as const;

/**
 * Live connection status for the one screen the app currently has.
 *
 * Deliberately does not retry and does not cache: this screen exists to answer
 * "is the backend up *right now*", and a retried or remembered answer would be
 * a worse answer than a fresh failure.
 */
export function useBackendHealth() {
  return useQuery<BackendStatus>({
    queryKey: backendHealthKey,
    queryFn: checkBackend,
    retry: false,
    gcTime: 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
