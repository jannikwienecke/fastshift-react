'use client';

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { PrismaContext } from './_internal/prisma-context';
import { PrismaClientType } from './prisma.client.types';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function PrismaQueryProvider({
  children,
  api,
}: {
  children: React.ReactNode;
  api: PrismaClientType;
}) {
  const queryClient = getQueryClient();

  return (
    <PrismaContext.Provider
      value={{
        prisma: api,
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PrismaContext.Provider>
  );
}
