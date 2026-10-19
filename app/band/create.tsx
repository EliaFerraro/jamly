import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Button, Screen, ScreenHeader } from '@/components';
import { CreateBandForm } from '@/features/band';
import { spacing } from '@/theme';

/**
 * Story A2 — create a band.
 *
 * Ends on the invite screen rather than back here: the link is the point of
 * creating a band at all, and it is presented immediately rather than left to
 * be found in settings later.
 */
export default function CreateBandScreen() {
  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <ScreenHeader title="New band" subtitle="A band needs only a name." />

          <CreateBandForm onCreated={() => router.replace('/band/invite')} />
        </View>

        <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
});
