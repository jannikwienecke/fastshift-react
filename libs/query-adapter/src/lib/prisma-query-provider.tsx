'use client';

import { BaseConfigInterface, globalConfigAtom } from '@apps-next/core';
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useHydrateAtoms } from 'jotai/utils';
import React from 'react';
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

export const queryClient = getQueryClient();

export function PrismaQueryProvider({
  children,
  api,
  config,
}: {
  children: React.ReactNode;
  api: PrismaClientType;
  config: BaseConfigInterface;
}) {
  return (
    <HydrateAtoms
      key={'global-config'}
      initialValues={[[globalConfigAtom, config]]}
    >
      <PrismaContext.Provider
        value={{
          prisma: {
            ...api,
            viewMutation(props) {
              return api.viewMutation({
                ...props,
                mutation: {
                  ...props.mutation,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  handler: undefined,
                },
              });
            },
          },
          config: config,
          provider: 'prisma',
        }}
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </PrismaContext.Provider>
    </HydrateAtoms>
  );
}

const HydrateAtoms = ({ initialValues, children }: any) => {
  useHydrateAtoms(initialValues, { dangerouslyForceHydrate: true });
  return children;
};
