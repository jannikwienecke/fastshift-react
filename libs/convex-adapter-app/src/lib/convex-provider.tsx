import { convexQuery, ConvexQueryClient } from '@convex-dev/react-query';
import {
  QueryClient,
  QueryClientProvider,
  QueryOptions,
} from '@tanstack/react-query';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ConvexQueryProviderProps } from './_internal/types.convex';

import { GlobalConfig, QueryProps } from '@apps-next/core';
import { QueryContext } from '@apps-next/react';
import React from 'react';
import { ConvexContext } from './_internal/convex-context';

export const ConvexContextProvider = (
  props: React.PropsWithChildren<{
    globalConfig: GlobalConfig;
  }>
) => {
  return (
    <ConvexContext.Provider value={{ ...props.globalConfig }}>
      {props.children}
    </ConvexContext.Provider>
  );
};

export const ConvexQueryProvider = (props: ConvexQueryProviderProps) => {
  const convex = new ConvexReactClient(props.convexUrl);

  const convexQueryClient = new ConvexQueryClient(convex);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });

  convexQueryClient.connect(queryClient);

  return (
    <ConvexContextProvider
      globalConfig={{
        ...props.globalConfig,
        provider: 'convex',
      }}
    >
      <QueryContext.Provider
        value={{
          prisma: {} as any,

          // makeQueryOptions:

          makeQueryOptions: (args: QueryProps) => {
            const return_ = convexQuery(props.viewLoader, {
              ...args,
              viewConfig: undefined,
              registeredViews: undefined,
            });

            return return_ as QueryOptions;
          },

          config: props.globalConfig.config,
          provider: 'default',
        }}
      >
        <ConvexProvider client={convex}>
          <QueryClientProvider client={queryClient}>
            {props.children}
          </QueryClientProvider>
        </ConvexProvider>
      </QueryContext.Provider>
    </ConvexContextProvider>
  );
};
