import { StyleSheet, View } from 'react-native';

import { Placeholder, Screen, ScreenHeader } from '@/components';
import { spacing } from '@/theme';

/** Everything the band plays. Stories B1-B5 (docs/product/11-mvp-scope.md). */
export default function RepertoireScreen() {
  return (
    <Screen scroll>
      <ScreenHeader title="Repertoire" subtitle="What we play" />

      <Placeholder
        what="Song list with title, artist, key, tempo, duration and status. Searchable, filterable, fast at 200+ songs."
        stories={['B1', 'B2', 'B3']}
      />

      <View style={styles.section}>
        <Placeholder
          what="Song detail: band info, charts, and my private notes — the personal layer that the whole v0.2 moat is built on."
          stories={['B4', 'B5']}
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
