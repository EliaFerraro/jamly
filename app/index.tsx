import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components';
import { useAuth, useMyProfile } from '@/features/auth';
import { useBackendHealth } from '@/features/health';
import type { BackendStatus } from '@/features/health';
import { colors, spacing } from '@/theme';

/**
 * The whole app, for now.
 *
 * v0.0 has two jobs: prove this device can reach the database, and prove the
 * person holding it is who the database thinks they are. Every feature is
 * built on top of those two answers, so it is worth being able to see them
 * plainly rather than inferring them from a screen that failed to load.
 */
export default function HomeScreen() {
  const { state, signOut } = useAuth();
  const { data, isFetching, refetch } = useBackendHealth();
  const profile = useMyProfile();

  const email = state.status === 'signedIn' ? state.user.email : '';

  return (
    <Screen scroll>
      <Text variant="title">Jamly</Text>
      <Text variant="caption" tone="muted" style={styles.subtitle}>
        v0.0 — signed in
      </Text>

      <Card style={styles.card}>
        <Text variant="heading">{profile.data?.displayName ?? email}</Text>
        <Text tone="secondary" style={styles.detail}>
          {profile.data?.displayName ? email : 'No display name set yet.'}
        </Text>

        {/* The profile row is the end-to-end proof: it can only arrive if the
            session's token satisfied the row-level security policy. */}
        {profile.isPending ? (
          <Text variant="caption" tone="muted" style={styles.detail}>
            Loading your profile…
          </Text>
        ) : profile.isError ? (
          <Text variant="caption" tone="danger" style={styles.detail}>
            Signed in, but your profile did not load — the profiles table
            may not be migrated yet.
          </Text>
        ) : profile.data ? (
          <Text variant="caption" tone="muted" style={styles.detail}>
            Plan: {profile.data.plan.replace('_', ' ')}
          </Text>
        ) : (
          <Text variant="caption" tone="warning" style={styles.detail}>
            No profile row for this account.
          </Text>
        )}
      </Card>

      <Card highlighted={data?.state === 'ok'} style={styles.card}>
        {isFetching || !data ? (
          <View style={styles.row}>
            <ActivityIndicator color={colors.textSecondary} />
            <Text tone="secondary" style={styles.rowText}>
              Checking…
            </Text>
          </View>
        ) : (
          <Result status={data} />
        )}
      </Card>

      <Button
        label={isFetching ? 'Checking…' : 'Check again'}
        onPress={() => void refetch()}
        disabled={isFetching}
        style={styles.button}
      />

      <Button
        label="Sign out"
        variant="secondary"
        onPress={() => void signOut()}
        style={styles.button}
      />
    </Screen>
  );
}

function Result({ status }: { status: BackendStatus }) {
  switch (status.state) {
    case 'ok':
      return (
        <>
          <Dot color={colors.success} />
          <Text variant="heading">Connected</Text>
          <Text tone="secondary" style={styles.detail}>
            {status.detail}
          </Text>
          <Text variant="caption" tone="muted" style={styles.detail}>
            Round trip {status.latencyMs} ms
          </Text>
        </>
      );

    case 'rejected':
      return (
        <>
          <Dot color={colors.warning} />
          <Text variant="heading">Refused</Text>
          <Text tone="secondary" style={styles.detail}>
            Supabase answered but rejected the request — usually a wrong or
            rotated key in .env.
          </Text>
          <Text variant="caption" tone="muted" style={styles.detail}>
            {status.detail}
          </Text>
        </>
      );

    case 'unreachable':
      return (
        <>
          <Dot color={colors.danger} />
          <Text variant="heading">No answer</Text>
          <Text tone="secondary" style={styles.detail}>
            Nothing came back. Check the network on this device, or whether
            the project is paused.
          </Text>
          <Text variant="caption" tone="muted" style={styles.detail}>
            {status.detail}
          </Text>
        </>
      );

    case 'unconfigured':
      return (
        <>
          <Dot color={colors.textMuted} />
          <Text variant="heading">Not configured</Text>
          <Text tone="secondary" style={styles.detail}>
            No Supabase URL or key found. Copy .env.example to .env and restart
            the dev server — Expo reads env vars only at startup.
          </Text>
        </>
      );
  }
}

/** Status colour is always paired with a word: a stage is full of coloured light. */
function Dot({ color }: { color: string }) {
  return <View style={[styles.dot, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: spacing.xs,
  },
  card: {
    marginTop: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    marginLeft: spacing.sm,
  },
  detail: {
    marginTop: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
  },
});
