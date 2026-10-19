import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useAuthUser } from '@/features/auth';
import { joinBandByCode } from '../api/band.repo';
import { parseInviteCode } from '../inviteLink';
import type { JoinResult } from '../types';
import { myBandsKey } from './useMyBands';

/**
 * Story A3, the redeeming half.
 *
 * The code is parsed before it is sent, so a pasted whole link works and a
 * typo never becomes a round trip.
 */
export function useJoinBand() {
  const user = useAuthUser();
  const queryClient = useQueryClient();
  const [isSubmitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<JoinResult | null>(null);

  const submit = useCallback(
    async (raw: string): Promise<JoinResult> => {
      const code = parseInviteCode(raw);

      if (!code) {
        const invalid: JoinResult = { ok: false, outcome: 'invalid' };
        setResult(invalid);
        return invalid;
      }

      setSubmitting(true);
      setResult(null);

      const outcome = await joinBandByCode(code);

      setSubmitting(false);
      setResult(outcome);

      if (outcome.ok && user) {
        await queryClient.invalidateQueries({ queryKey: myBandsKey(user.id) });
      }

      return outcome;
    },
    [queryClient, user],
  );

  return { submit, isSubmitting, result };
}
