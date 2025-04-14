import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { QueryClientProvider, QueryOptions } from '@tanstack/react-query';
import { ConvexProvider } from 'convex/react';
import { ConvexQueryProviderProps, ViewLoader } from './_internal/types.convex';

import {
  configManager,
  convertDisplayOptionsForBackend,
  convertFiltersForBackend,
  DEFAULT_FETCH_LIMIT_QUERY,
  QueryProps,
  UserViewData,
  ViewConfigType,
} from '@apps-next/core';
import { QueryContext } from '@apps-next/react';
import React from 'react';

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

  const makeQueryOptions = React.useCallback(
    (args: QueryProps) => {
      const return_ = convexQuery(props.viewLoader, {
        ...args,
        viewConfig: undefined,
        registeredViews: undefined,
      });

      return return_ as QueryOptions;
    },
    [props.viewLoader]
  );

  return (
    <QueryContext.Provider
      value={{
        mutationFn,

        makeQueryOptions,

        config: props.globalConfig.config,
        provider: 'default',
      }}
    >
      {props.children}
    </QueryContext.Provider>
  );
};

const makeQuery = (
  viewLoader: ViewLoader,
  viewConfig: ViewConfigType,
  userViewData?: UserViewData
) => {
  const mergedConfig = configManager(viewConfig).mergeAndCreate(userViewData);

  return convexQuery(viewLoader, {
    viewName: viewConfig.viewName,
    query: '',
    filters: convertFiltersForBackend(mergedConfig.filters),
    displayOptions: convertDisplayOptionsForBackend(
      mergedConfig.dispplayOptions
    ),
    paginateOptions: {
      cursor: { position: null, cursor: null },
      numItems: DEFAULT_FETCH_LIMIT_QUERY,
    },
  });
};

export const preloadQuery = (
  viewLoader: ConvexContext['viewLoader'],
  viewConfig: ViewConfigType,
  userViewData?: UserViewData
) => makeQuery(viewLoader, viewConfig, userViewData);

export type ConvexContext = {
  viewLoader: ViewLoader;
};

export type ConvexPreloadQuery = (
  viewConfig: ViewConfigType,
  viewName: string
) => void;
