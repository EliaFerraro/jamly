import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type CardProps = {
  children: ReactNode;
  /** Marks this card as "now" — the next event, the current song. Use sparingly. */
  highlighted?: boolean;
  style?: ViewStyle;
};

/**
 * Elevation is layered surfaces, never shadows: shadows are invisible on a
 * dark stage (docs/design/20-design-principles.md).
 */
export function Card({ children, highlighted = false, style }: CardProps) {
  return (
    <View style={[styles.card, highlighted && styles.highlighted, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  highlighted: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.accent,
  },
});
