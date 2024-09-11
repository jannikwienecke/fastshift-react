'use client';

import {
  ApiClientType,
  BaseConfigInterface,
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  DataModelNew,
  makeData,
  makeQueryKey,
  QueryReturnOrUndefined,
  RecordType,
  RegisteredViews,
  ViewFieldsConfig,
} from '@apps-next/core';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai';
import React from 'react';
import { QueryContext } from './query-context';
import { QueryStore, queryStoreAtom } from './query-store';
import { HydrateAtoms } from './ui-components';
import {
  viewConfigManagerAtom,
  registeredViewsAtom,
  globalConfigAtom,
  clientViewConfigAtom,
  clientConfigStore,
} from './stores';

export type QueryProviderProps = {
  viewConfig: BaseViewConfigManagerInterface['viewConfig'];
  api: ApiClientType;
  globalConfig: BaseConfigInterface;
  views: RegisteredViews;
} & { children: React.ReactNode };

type QueryProviderPropsWithViewFieldsConfig = QueryProviderProps & {
  viewFieldsConfig: ViewFieldsConfig;
  queryClient: QueryClient;
};

export const ClientViewProvider = (
  props: QueryProviderPropsWithViewFieldsConfig
) => {
  return (
    <QueryClientProvider client={props.queryClient}>
      <Content {...props} />
    </QueryClientProvider>
  );
};

export const Content = (props: QueryProviderPropsWithViewFieldsConfig) => {
  const api = props.api;

  const viewConfigManager = new BaseViewConfigManager(props.viewConfig);

  const registeredViews = props.globalConfig.defaultViewConfigs;
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
    [clientViewConfigAtom, props.viewFieldsConfig],
  ];

  return (
    <Provider store={clientConfigStore}>
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
    </Provider>
  );
};
