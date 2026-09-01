import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

type ScreenProps = {
  children: ReactNode;
  /** Wrap content in a ScrollView. Off for screens that own their own list. */
  scroll?: boolean;
  /** Drop horizontal padding — for full-bleed lists and performance mode. */
  bleed?: boolean;
};

/** Standard screen container: safe areas, background, consistent padding. */
export function Screen({ children, scroll = false, bleed = false }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + spacing.md,
    paddingBottom: insets.bottom + spacing.md,
    paddingHorizontal: bleed ? 0 : spacing.md,
  };

  if (scroll) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={padding}>
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.root, padding]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
