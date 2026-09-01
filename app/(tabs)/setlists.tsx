import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Placeholder, Screen, ScreenHeader } from '@/components';
import { spacing } from '@/theme';

/** Setlists. Stories D1-D3, and the entry into performance mode (E1-E3). */
export default function SetlistsScreen() {
  return (
    <Screen scroll>
      <ScreenHeader title="Setlists" subtitle="What we're playing" />

      <Placeholder
        what="Build a set from the repertoire: drag to reorder, add breaks and set markers, see the running time."
        stories={['D1', 'D2']}
      />

      <View style={styles.section}>
        <Placeholder
          what="Read-only view for members — everyone sees the same version, always."
          stories={['D3']}
        />
      </View>

      <Button
        label="Open performance mode"
        onPress={() => router.push('/performance/demo')}
        style={styles.cta}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
  },
  cta: {
    marginTop: spacing.lg,
  },
});
