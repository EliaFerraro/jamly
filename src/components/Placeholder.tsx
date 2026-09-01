import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';

type PlaceholderProps = {
  /** What this screen will do, in one line. */
  what: string;
  /** The user stories this screen implements, e.g. ['D1', 'D2']. */
  stories?: string[];
};

/**
 * Scaffolding marker for a screen that exists in the navigation but has no
 * behaviour yet. Deliberately NOT an EmptyState: empty states are a user-facing
 * design problem with rules of their own (never assign the user homework —
 * docs/design/20-design-principles.md). This is a note to the developer and it
 * disappears as v0.1 is built.
 */
export function Placeholder({ what, stories }: PlaceholderProps) {
  return (
    <View style={styles.root}>
      <Text variant="body" tone="secondary">
        {what}
      </Text>
      {stories?.length ? (
        <Text variant="caption" tone="muted" style={styles.stories}>
          v0.1 stories: {stories.join(', ')} — see docs/product/11-mvp-scope.md
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  stories: {
    marginTop: spacing.xs,
  },
});
