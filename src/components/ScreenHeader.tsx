import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';
import { Text } from './Text';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.root}>
      <Text variant="title">{title}</Text>
      {subtitle ? (
        <Text variant="caption" tone="muted" style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
