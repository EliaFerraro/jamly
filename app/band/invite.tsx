import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, ScreenHeader, Text } from '@/components';
import { InviteCard, useCurrentBand } from '@/features/band';
import { colors, spacing } from '@/theme';

/**
 * The invite link, on its own screen.
 *
 * Reached straight after creating a band (story A2) and from the band home at
 * any time — never buried, because inviting is the core feature and not a
 * settings row (docs/design/20-design-principles.md).
 */
export default function InviteScreen() {
  const { membership, isPending } = useCurrentBand();

  if (isPending) {
    return (
      <Screen>
        <View style={styles.centred}>
          <ActivityIndicator color={colors.textSecondary} />
        </View>
      </Screen>
    );
  }

  if (!membership) {
    return (
      <Screen>
        <ScreenHeader title="Invite" />
        <Card>
          <Text tone="secondary">You&apos;re not in a band yet.</Text>
        </Card>
        <Button label="Back" variant="ghost" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader title={membership.band.name} subtitle="Get the rest of the band in." />

      <InviteCard band={membership.band} role={membership.role} />

      <Button
        label="Done"
        variant="secondary"
        onPress={() => router.replace('/')}
        style={styles.done}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: {
    marginTop: spacing.lg,
  },
});
