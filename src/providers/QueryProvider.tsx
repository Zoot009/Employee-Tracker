// 3. Fix src/providers/QueryProvider.tsx - Remove devtools in production
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1 * 60 * 1000, // 1 minute
            retry: 1, // Reduce retries
            retryDelay: 1000,
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: false,
          },
          mutations: {
            retry: 0, // No retries for mutations
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}