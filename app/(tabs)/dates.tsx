import { StyleSheet, View } from 'react-native';

import { Placeholder, Screen, ScreenHeader } from '@/components';
import { spacing } from '@/theme';

/** Rehearsals and gigs. Stories C1-C3 (docs/product/11-mvp-scope.md). */
export default function DatesScreen() {
  return (
    <Screen scroll>
      <ScreenHeader title="Dates" subtitle="Rehearsals and gigs" />

      <Placeholder
        what="Upcoming and past events, rehearsals and gigs distinguished at a glance."
        stories={['C1', 'C2']}
      />

      <View style={styles.section}>
        <Placeholder
          what="Availability: yes / no / maybe in one tap, so the leader stops chasing five people."
          stories={['C3']}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
  },
});
