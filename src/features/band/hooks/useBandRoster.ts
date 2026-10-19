import { useQuery } from '@tanstack/react-query';

import { getBandRoster } from '../api/band.repo';
import type { RosterMember } from '../types';

export const bandRosterKey = (bandId: string) => ['band', bandId, 'roster'] as const;

/** Who is in the band. Disabled until there is a band to ask about. */
export function useBandRoster(bandId: string | null) {
  return useQuery<RosterMember[]>({
    queryKey: bandRosterKey(bandId ?? 'none'),
    queryFn: () => getBandRoster(bandId as string),
    enabled: Boolean(bandId),
  });
}
