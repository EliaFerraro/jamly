import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Field, Text } from '@/components';
import { spacing } from '@/theme';
import type { Band } from '@/types/domain';
import { useCreateBand } from '../hooks/useCreateBand';

/**
 * Story A2: a band needs only a name to exist.
 *
 * One field, deliberately. Genre, logo and description are each a thing a
 * musician must fill in before getting any value, and every one of them is a
 * reason to put the phone down (R2).
 */
export function CreateBandForm({ onCreated }: { onCreated: (band: Band) => void }) {
  const [name, setName] = useState('');
  const { submit, isSubmitting, failure } = useCreateBand();

  const send = async () => {
    const band = await submit(name);
    if (band) onCreated(band);
  };

  return (
    <View style={styles.root}>
      <Field
        label="Band name"
        value={name}
        onChangeText={setName}
        placeholder="The Midnight Hours"
        autoCapitalize="words"
        autoCorrect
        spellCheck
        returnKeyType="go"
        onSubmitEditing={() => void send()}
        editable={!isSubmitting}
        maxLength={80}
      />

      {failure ? (
        <Text tone="danger" accessibilityLiveRegion="polite">
          {failure.message}
        </Text>
      ) : null}

      <Button
        label={isSubmitting ? 'Creating…' : 'Create band'}
        onPress={() => void send()}
        disabled={isSubmitting || !name.trim()}
      />

      <Text variant="caption" tone="muted">
        You&apos;ll get a link to share with the rest of the band straight away.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
});
