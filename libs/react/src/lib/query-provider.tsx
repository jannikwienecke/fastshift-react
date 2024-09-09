'use client';

import {
  ApiClientType,
  BaseConfigInterface,
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  ClientViewConfig,
  clientViewConfigAtom,
  DataModelNew,
  globalConfigAtom,
  IncludeConfig,
  makeData,
  makeQueryKey,
  QueryReturnOrUndefined,
  RecordType,
  RegisteredViews,
  registeredViewsAtom,
  viewConfigManagerAtom,
} from '@apps-next/core';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { QueryContext } from './query-context';
import { QueryStore, queryStoreAtom } from './query-store';
import { HydrateAtoms } from './ui-components';

// used in apps like nextjs when prefetching data and creating
// the view config in the server.
// Used together with QueryPrefetchProvider

type QueryProviderProps = {
  viewConfig: BaseViewConfigManagerInterface['viewConfig'];
  api: ApiClientType;
  includeConfig: IncludeConfig;
  globalConfig: BaseConfigInterface;
  views: RegisteredViews;
  queryClient: QueryClient;
  clientConfig: ClientViewConfig<unknown, any>;
} & { children: React.ReactNode };

export const QueryProvider = (props: QueryProviderProps) => {
  return (
    <QueryClientProvider client={props.queryClient}>
      <Content {...props} />;
    </QueryClientProvider>
  );
};

export const Content = (props: QueryProviderProps) => {
  const api = props.api;

  const viewConfigManager = new BaseViewConfigManager(props.viewConfig);

  const registeredViews = props.globalConfig.defaultViewConfigs;
  // const queryClient = useQueryClient();
  const data = props.queryClient.getQueryData(
    makeQueryKey({
      viewName: viewConfigManager.getViewName(),
    })
  ) as QueryReturnOrUndefined;

  const dataModel = makeData(
    registeredViews,
    viewConfigManager.getViewName()
  )(data?.data ?? []);

  const relationalDataModel = Object.entries(data?.relationalData ?? {}).reduce(
    (acc, [tableName, data]) => {
      const viewConfig = registeredViews[tableName];
      acc[tableName] = makeData(registeredViews, viewConfig?.tableName)(data);
      return acc;
    },
    {} as { [key: string]: DataModelNew<RecordType> }
  );

  const queryStore: QueryStore<RecordType> = {
    dataModel,
    relationalDataModel,
    loading: false,
    error: null,
    page: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    isInitialized: true,
    viewName: viewConfigManager.getViewName(),
  };

  const initialValues = [
    [viewConfigManagerAtom, viewConfigManager],
    [
      registeredViewsAtom,
      {
        ...props.globalConfig.defaultViewConfigs,
        ...props.views,
      },
    ],
    [globalConfigAtom, props.globalConfig],
    [queryStoreAtom, queryStore],
    [clientViewConfigAtom, props.clientConfig],
  ];

  return (
    <QueryContext.Provider
      value={{
        prisma: {
          ...props.api,
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
        config: props.globalConfig,
        provider: 'default',
      }}
    >
      <HydrateAtoms
        key={viewConfigManager.getViewName()}
        initialValues={initialValues}
      >
        {props.children}
      </HydrateAtoms>
    </QueryContext.Provider>
  );
};
