import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Screen, Text } from '@/components';
import { SignInForm } from '@/features/auth';
import { spacing } from '@/theme';

/**
 * The only screen an unauthenticated device can reach.
 *
 * Story A1 asks for sign-in without ceremony: two fields, one button, no
 * wizard, no marketing (docs/product/11-mvp-scope.md).
 */
export default function SignInScreen() {
  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <Text variant="title">Jamly</Text>
          <Text tone="secondary" style={styles.subtitle}>
            Sign in to get to your band.
          </Text>

          <View style={styles.form}>
            <SignInForm />
          </View>
        </View>
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
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  form: {
    marginTop: spacing.xl,
  },
});
