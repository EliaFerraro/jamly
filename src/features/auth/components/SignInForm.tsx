import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button, Text } from '@/components';
import { spacing } from '@/theme';
import { formatWait } from '../attempts';
import { useSignIn } from '../hooks/useSignIn';
import { Field } from './Field';

/**
 * Email and password, and nothing else.
 *
 * There is no sign-up link because there is no self-serve sign-up: accounts are
 * created deliberately while Jamly is being built (ADR-0008). A dead link to a
 * screen that refuses you is worse than no link.
 */
export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordField = useRef<TextInput>(null);
  const { submit, isSubmitting, problem, failure, cooldownRemainingMs } = useSignIn();

  const waiting = cooldownRemainingMs > 0;
  const send = () => void submit(email, password);

  return (
    <View style={styles.root}>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={problem?.field === 'email' ? problem.message : undefined}
        autoCapitalize="none"
        keyboardType="email-address"
        inputMode="email"
        // `username` rather than `emailAddress`: it is what pairs this field
        // with the password below in iOS Keychain and Android autofill.
        textContentType="username"
        autoComplete="email"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordField.current?.focus()}
        editable={!isSubmitting}
        placeholder="you@band.com"
      />

      <Field
        label="Password"
        secret
        inputRef={passwordField}
        value={password}
        onChangeText={setPassword}
        error={problem?.field === 'password' ? problem.message : undefined}
        autoCapitalize="none"
        textContentType="password"
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={send}
        editable={!isSubmitting}
      />

      {failure ? (
        <Text tone="danger" accessibilityLiveRegion="polite">
          {failure.message}
        </Text>
      ) : null}

      {waiting ? (
        <Text variant="caption" tone="muted" accessibilityLiveRegion="polite">
          Too many attempts. Try again in {formatWait(cooldownRemainingMs)}.
        </Text>
      ) : null}

      <Button
        label={isSubmitting ? 'Signing in…' : 'Sign in'}
        onPress={send}
        disabled={isSubmitting || waiting}
        style={styles.button}
      />

      <Text variant="caption" tone="muted">
        Jamly is invite-only while it is being built.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  button: {
    marginTop: spacing.xs,
  },
});
