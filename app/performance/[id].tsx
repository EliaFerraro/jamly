import { router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components';
import { colors, radius, spacing, touchTarget } from '@/theme';

/**
 * Performance mode — a full-screen takeover, entered and exited deliberately.
 *
 * Stories E1-E3. The physical constraints (docs/design/20-design-principles.md,
 * Rule 3): read at 1.5m, in the dark, by someone holding an instrument, in one
 * glance between phrases.
 *
 * Two rules this screen must never break:
 *  - Nothing may interrupt a show. No modals, no update prompts, no errors.
 *  - Never trap anyone in a synced view: detaching is one obvious tap.
 */
export default function PerformanceModeScreen() {
  // The screen must not sleep during a show.
  useKeepAwake();

  const [attached, setAttached] = useState(true);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={attached ? 'Following the band. Tap to browse freely.' : 'Browsing freely. Tap to follow the band.'}
          onPress={() => setAttached((value) => !value)}
          style={styles.syncPill}
        >
          <View
            style={[styles.dot, { backgroundColor: attached ? colors.synced : colors.detached }]}
          />
          <Text variant="caption" tone={attached ? 'primary' : 'muted'}>
            {attached ? 'Following' : 'Browsing'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exit performance mode"
          onPress={() => router.back()}
          style={styles.exit}
        >
          <Text variant="caption" tone="muted">
            Exit
          </Text>
        </Pressable>
      </View>

      <View style={styles.stage}>
        <Text variant="caption" tone="accent">
          NOW
        </Text>
        <Text variant="stage" style={styles.nowTitle}>
          Superstition
        </Text>
        <Text variant="stageNext" tone="secondary">
          Em · 100 BPM
        </Text>
      </View>

      <View style={styles.next}>
        <Text variant="caption" tone="muted">
          NEXT
        </Text>
        <Text variant="stageNext" tone="secondary">
          Sir Duke · B · 128 BPM
        </Text>
      </View>

      <Text variant="caption" tone="muted" style={styles.sample}>
        Sample content. Live sync (ADR-0004) arrives with story E2 — the leader advances
        and every attached device follows within 2 seconds.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.black, // maximum contrast: darker than the app background
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  exit: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  stage: {
    flex: 1,
    justifyContent: 'center',
  },
  nowTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  next: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  sample: {
    marginTop: spacing.md,
  },
});
