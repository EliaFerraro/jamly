import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useAuthUser } from '@/features/auth';
import type { Band } from '@/types/domain';
import { createBand } from '../api/band.repo';
import type { BandFailure } from '../types';
import { myBandsKey } from './useMyBands';

/**
 * Story A2: a band exists as soon as it has a name.
 *
 * Not useMutation: this is a single call whose result the screen navigates on,
 * and the hook boundary is where errors stop being exceptions
 * (docs/tech/33-conventions.md).
 */
export function useCreateBand() {
  const user = useAuthUser();
  const queryClient = useQueryClient();
  const [isSubmitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<BandFailure | null>(null);

  const submit = useCallback(
    async (name: string): Promise<Band | null> => {
      setSubmitting(true);
      setFailure(null);

      const result = await createBand(name);

      setSubmitting(false);

      if (!result.ok) {
        setFailure(result.failure);
        return null;
      }

      if (user) {
        await queryClient.invalidateQueries({ queryKey: myBandsKey(user.id) });
      }

      return result.band;
    },
    [queryClient, user],
  );

  return { submit, isSubmitting, failure };
}
