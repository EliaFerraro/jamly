import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Placeholder, Screen, ScreenHeader, Text } from '@/components';
import { spacing } from '@/theme';

/**
 * BandHome — the default screen.
 *
 * Story C2: a member who opens the app cold sees the next event with ZERO taps.
 * This screen is designed for Sara, the passive member, who decides whether the
 * whole product succeeds (docs/business/03-personas-and-jtbd.md).
 */
export default function BandHomeScreen() {
  return (
    <Screen scroll>
      <ScreenHeader title="Your band" subtitle="Nothing to configure. Just what's next." />

      {/* The next event is the top of this screen, always. Not in a tab, not
          behind navigation. Highlighted because it is "now". */}
      <Card highlighted>
        <Text variant="caption" tone="accent">
          NEXT UP
        </Text>
        <Text variant="heading" style={styles.eventTitle}>
          Saturday, 21:00 — Blue Note
        </Text>
        <Text variant="body" tone="secondary">
          Gig · load-in 19:30 · 18 songs
        </Text>
        <View style={styles.actions}>
          <Button
            label="Start performance"
            onPress={() => router.push('/performance/demo')}
            style={styles.action}
          />
          <Button label="I'm coming" variant="secondary" style={styles.action} />
        </View>
        <Text variant="caption" tone="muted" style={styles.sample}>
          Sample content — the shape of story C2, not real data yet.
        </Text>
      </Card>

      <View style={styles.section}>
        <Placeholder
          what="Band members, roles and instruments."
          stories={['A2', 'A4']}
        />
      </View>

      <View style={styles.section}>
        <Placeholder
          what="Invite link — the most important control in the product, never buried in settings."
          stories={['A2', 'A3']}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eventTitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  action: {
    flex: 1,
  },
  sample: {
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.md,
  },
});
