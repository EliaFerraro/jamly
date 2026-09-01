import { Tabs } from 'expo-router';

import { colors, touchTarget, typography } from '@/theme';

/**
 * Five tabs: Band, Repertoire, Dates, Setlists, Me.
 *
 * They match how bands actually think, and they are expected to survive to
 * v1.0 — a release that needs a sixth tab is a signal the product is sprawling
 * rather than deepening (docs/design/21-information-architecture.md).
 *
 * "Band" is home: it answers "what's next" with zero taps, for the passive
 * member who is the primary persona.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          minHeight: touchTarget + 8,
        },
        tabBarLabelStyle: { fontSize: typography.caption.fontSize },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Band' }} />
      <Tabs.Screen name="repertoire" options={{ title: 'Repertoire' }} />
      <Tabs.Screen name="dates" options={{ title: 'Dates' }} />
      <Tabs.Screen name="setlists" options={{ title: 'Setlists' }} />
      <Tabs.Screen name="me" options={{ title: 'Me' }} />
    </Tabs>
  );
}
