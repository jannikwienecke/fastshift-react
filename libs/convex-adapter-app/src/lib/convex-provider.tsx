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
        viewId: args.viewId ?? null,
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
  userViewData: UserViewData | null,
  viewId: string | null,
  parentViewName: string | null,
  parentId: string | null
) => {
  if (!viewConfig) {
    console.trace();
    throw new Error('viewConfig is required');
  }
  const mergedConfig = configManager(viewConfig).mergeAndCreate(
    userViewData ?? undefined
  );

  if (viewId) {
    return convexQuery(viewLoader, {
      viewName: viewConfig.viewName,
      query: '',
      filters: '',
      displayOptions: '',
      viewId: viewId ?? null,
    });
  }

  const query = convexQuery(viewLoader, {
    viewName: viewConfig.viewName,
    query: '',
    filters: viewId ? '' : convertFiltersForBackend(mergedConfig.filters),
    displayOptions: viewId
      ? ''
      : convertDisplayOptionsForBackend(mergedConfig.displayOptions),
    viewId: viewId ?? null,
    parentId: parentId ?? null,
    parentViewName: parentViewName ?? null,
    paginateOptions: viewId
      ? undefined
      : {
          cursor: { position: null, cursor: null },
          numItems: DEFAULT_FETCH_LIMIT_QUERY,
        },
  });

  return query;
};

export const preloadQuery = (
  viewLoader: ConvexContext['viewLoader'],
  viewConfig: ViewConfigType,
  userViewData: UserViewData | null,
  viewId: string | null = null,
  parentViewName: string | null = null,
  parentId: string | null = null
) => {
  const query = makeQuery(
    viewLoader,
    viewConfig,
    userViewData,
    viewId,
    parentViewName,
    parentId
  );

  return query;
};

export type ConvexContext = {
  viewLoader: ViewLoader;
};

export type ConvexPreloadQuery = (
  viewConfig: ViewConfigType,
  viewName: string,
  viewId: string | null,
  parentViewName: string | null,
  parentId: string | null
) => void;
