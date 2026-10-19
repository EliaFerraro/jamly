import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/features/auth';
import { colors } from '@/theme';

export default function RootLayout() {
  // Server state lives in TanStack Query; UI state in Zustand; the offline
  // cache in SQLite. Keeping the three separate is the cheapest architectural
  // decision in the project (docs/tech/30-architecture.md).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // how long to consider a query result as fresh
            retry: 1, // how many times to retry a failed query
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

/**
 * Which half of the app exists right now.
 *
 * The guards are the only thing that decides: no screen redirects, and no
 * screen may be reached by a route that the session does not allow. Expo
 * Router removes an unguarded route from the navigator entirely, so there is
 * no signed-out state in which the app's own screens are merely hidden.
 */
function RootNavigator() {
  const { state } = useAuth();

  // Reading the keystore takes a few milliseconds. Rendering the sign-in
  // screen during them would flash it in the face of a musician who is
  // already signed in — every single cold start.
  if (state.status === 'restoring') {
    return (
      <View style={styles.booting}>
        <ActivityIndicator color={colors.textSecondary} />
      </View>
    );
  }

  const isSignedIn = state.status === 'signedIn';

  return (
    <Stack // Stack is the navigation history
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'fade',
      }}
    >
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="band/create" />
        <Stack.Screen name="band/invite" />
        <Stack.Screen name="join/[code]" />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)/sign-in" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  booting: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
