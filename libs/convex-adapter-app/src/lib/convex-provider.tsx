import {
  convexQuery,
  ConvexQueryClient,
  useConvexMutation,
} from '@convex-dev/react-query';
import {
  QueryClient,
  QueryClientProvider,
  QueryOptions,
} from '@tanstack/react-query';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ConvexQueryProviderProps } from './_internal/types.convex';

import { QueryProps } from '@apps-next/core';
import { QueryContext } from '@apps-next/react';

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
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        <ProviderContent {...props} />
      </QueryClientProvider>
    </ConvexProvider>
  );
};

const ProviderContent = (props: ConvexQueryProviderProps) => {
  const mutationFn = useConvexMutation(props.viewMutation);

  return (
    <QueryContext.Provider
      value={{
        mutationFn,

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
      {props.children}
    </QueryContext.Provider>
  );
};
