import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components';
import { useBackendHealth } from '@/features/health';
import type { BackendStatus } from '@/features/health';
import { colors, spacing } from '@/theme';

/**
 * The whole app, for now.
 *
 * v0.0 has one job: prove the phone in your hand can reach the database. Every
 * feature is built on top of that answer, so it is worth being able to see it
 * plainly rather than inferring it from a screen that failed to load.
 */
export default function BackendStatusScreen() {
  const { data, isFetching, refetch } = useBackendHealth();

  return (
    <Screen>
      <View style={styles.body}>
        <Text variant="title">Jamly</Text>
        <Text variant="caption" tone="muted" style={styles.subtitle}>
          v0.0 — connection check
        </Text>

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
      </View>
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
  body: {
    flex: 1,
    justifyContent: 'center',
  },
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
