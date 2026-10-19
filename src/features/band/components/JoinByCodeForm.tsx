import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Field, Text } from '@/components';
import { spacing } from '@/theme';
import { useJoinBand } from '../hooks/useJoinBand';
import type { JoinResult } from '../types';

/** Every way this can fail, said in words rather than in a status. */
function problemWith(result: Extract<JoinResult, { ok: false }>): string {
  if (result.outcome === 'expired') {
    return 'That link has expired — ask your band leader for a new one.';
  }
  if (result.outcome === 'invalid') {
    return "That code doesn't match any band. Check it and try again.";
  }
  return result.failure.message;
}

/**
 * The way in when the link itself did not work.
 *
 * Tapping the link is the real path (story A3). This exists because a link
 * that opens the wrong app, or arrives on a device without a build installed,
 * is the most likely thing to go wrong in the flow the product depends on —
 * and being stuck with a link you cannot use is a worse first impression than
 * typing twelve characters.
 */
export function JoinByCodeForm({ onJoined }: { onJoined?: () => void }) {
  const [code, setCode] = useState('');
  const { submit, isSubmitting, result } = useJoinBand();

  const send = async () => {
    const outcome = await submit(code);
    if (outcome.ok) onJoined?.();
  };

  return (
    <View style={styles.root}>
      <Field
        label="Invite code"
        value={code}
        onChangeText={setCode}
        placeholder="Paste the link or the code"
        autoCapitalize="none"
        returnKeyType="go"
        onSubmitEditing={() => void send()}
        editable={!isSubmitting}
      />

      {result && !result.ok ? (
        <Text tone="danger" accessibilityLiveRegion="polite">
          {problemWith(result)}
        </Text>
      ) : null}

      <Button
        label={isSubmitting ? 'Joining…' : 'Join a band'}
        variant="secondary"
        onPress={() => void send()}
        disabled={isSubmitting || !code.trim()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
});
