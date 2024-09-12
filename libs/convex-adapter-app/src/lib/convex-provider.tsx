import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { QueryClientProvider, QueryOptions } from '@tanstack/react-query';
import { ConvexProvider } from 'convex/react';
import { ConvexQueryProviderProps, ViewLoader } from './_internal/types.convex';

import { QueryProps, ViewConfigType } from '@apps-next/core';
import { QueryContext } from '@apps-next/react';

export const ConvexQueryProvider = (props: ConvexQueryProviderProps) => {
  const { queryClient, convex } = props;

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

export const preloadQuery = (
  viewLoader: ConvexContext['viewLoader'],
  viewConfig: ViewConfigType
) =>
  convexQuery(viewLoader, {
    query: '',
    viewName: viewConfig.viewName,
  });

export type ConvexContext = {
  viewLoader: ViewLoader;
};

export type ConvexPreloadQuery = (viewConfig: ViewConfigType) => void;
