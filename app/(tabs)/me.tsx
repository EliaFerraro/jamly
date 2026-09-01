import { StyleSheet, View } from 'react-native';

import { Placeholder, Screen, ScreenHeader, Text } from '@/components';
import { spacing } from '@/theme';

/**
 * The personal half of Jamly.
 *
 * This tab ships in v0.1 holding almost nothing, on purpose: it reserves the
 * home for the personal layer so that v0.2's practice features are additive
 * rather than a redesign (decision D13).
 */
export default function MeScreen() {
  return (
    <Screen scroll>
      <ScreenHeader title="Me" subtitle="Your playing, not the band's" />

      <Placeholder what="Profile: display name, instruments." stories={['A4']} />

      <View style={styles.section}>
        <Placeholder what="All my private song notes in one place." stories={['B5']} />
      </View>

      <View style={styles.section}>
        <Text variant="caption" tone="muted">
          v0.2 lands here: practice logging, per-song confidence, and the practice list
          generated from the band&apos;s next setlist — the one thing no competitor can do.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
  },
});
