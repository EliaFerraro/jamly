import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
            // Cache-first: the UI never blocks on the network for data it
            // already has. A venue has concrete walls (Design Rule 4).
            staleTime: 1000 * 60,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
