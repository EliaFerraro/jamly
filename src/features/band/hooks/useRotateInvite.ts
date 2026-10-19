import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useAuthUser } from '@/features/auth';
import { rotateInviteCode } from '../api/band.repo';
import type { BandFailure } from '../types';
import { myBandsKey } from './useMyBands';

/** Resetting the link is the answer to "it ended up in the wrong chat". */
export function useRotateInvite() {
  const user = useAuthUser();
  const queryClient = useQueryClient();
  const [isSubmitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<BandFailure | null>(null);

  const submit = useCallback(
    async (bandId: string): Promise<boolean> => {
      setSubmitting(true);
      setFailure(null);

      const result = await rotateInviteCode(bandId);

      setSubmitting(false);

      if (!result.ok) {
        setFailure(result.failure);
        return false;
      }

      if (user) {
        await queryClient.invalidateQueries({ queryKey: myBandsKey(user.id) });
      }

      return true;
    },
    [queryClient, user],
  );

  return { submit, isSubmitting, failure };
}
