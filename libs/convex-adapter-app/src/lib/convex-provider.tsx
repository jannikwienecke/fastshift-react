import { ConvexQueryClient } from '@convex-dev/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import {
  ConvexApiType,
  ConvexQueryProviderProps,
} from './_internal/types.convex';

import React from 'react';
import { ConvexContext } from './_internal/convex-context';

export const ConvexContextProvider = (
  props: React.PropsWithChildren<{ api: ConvexApiType }>
) => {
  return (
    <ConvexContext.Provider value={{ api: props.api }}>
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
    <ConvexContextProvider api={props.api}>
      <ConvexProvider client={convex}>
        <QueryClientProvider client={queryClient}>
          {props.children}
        </QueryClientProvider>
      </ConvexProvider>
    </ConvexContextProvider>
  );
};
