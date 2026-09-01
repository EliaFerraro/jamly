import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Button, Card, Screen, Text } from '@/components';
import { spacing } from '@/theme';

/**
 * JoinBand — the most important screen in the product.
 *
 * Story A3, and the budget it has to meet: from tapping the link to seeing the
 * band's next event in UNDER 30 SECONDS and at most 4 taps, for someone who has
 * never heard of Jamly.
 *
 * The documented failure of every competitor is that the drummer never joins
 * (docs/business/06-risks-and-open-questions.md, R2). Sign-in is folded into
 * this flow — never a wall in front of it — and joining lands on real content,
 * never an empty state.
 */
export default function JoinBandScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();

  return (
    <Screen>
      <Card style={styles.card}>
        <Text variant="caption" tone="accent">
          YOU&apos;VE BEEN INVITED
        </Text>
        <Text variant="title" style={styles.title}>
          Join the band
        </Text>
        <Text variant="body" tone="secondary">
          Invite code: {code ?? 'unknown'}
        </Text>
        <Text variant="caption" tone="muted" style={styles.note}>
          One tap. No account form, no setup, no tutorial. Sign-in happens inside this
          flow, not in front of it.
        </Text>
        <Button label="Join" onPress={() => router.replace('/')} style={styles.cta} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.xxl,
  },
  title: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  note: {
    marginTop: spacing.md,
  },
  cta: {
    marginTop: spacing.lg,
  },
});
