'use client';

import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  clientConfigStore,
  DataModelNew,
  globalConfigAtom,
  IncludeConfig,
  makeData,
  makeQueryKey,
  QueryReturnOrUndefined,
  RecordType,
  registeredViewsAtom,
  viewConfigManagerAtom,
  ViewContextType,
} from '@apps-next/core';

import { Provider, useAtomValue } from 'jotai';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryStore, queryStoreAtom } from './query-store';
import { HydrateAtoms } from './ui-components';

export const ServerSideConfigContext = React.createContext<ViewContextType>(
  {} as ViewContextType
);

// used in apps like nextjs when prefetching data and creating
// the view config in the server.
// Used together with QueryPrefetchProvider
export const QueryProviderAnother = (
  props: {
    viewConfig: BaseViewConfigManagerInterface['viewConfig'];
    includeConfig: IncludeConfig;
  } & { children: React.ReactNode }
) => {
  const viewConfigManager = new BaseViewConfigManager(props.viewConfig);

  const globalConfig = useAtomValue(globalConfigAtom);
  const registeredViews = globalConfig.defaultViewConfigs;

  const queryClient = useQueryClient();

  const data = queryClient.getQueryData(
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
    [registeredViewsAtom, globalConfig.defaultViewConfigs],
    [globalConfigAtom, globalConfig],
    [queryStoreAtom, queryStore],
  ];

  return (
    <Provider store={clientConfigStore}>
      <HydrateAtoms
        key={viewConfigManager.getViewName()}
        initialValues={initialValues}
      >
        <ServerSideConfigContext.Provider
          value={{
            viewConfigManager,
            registeredViews,
          }}
        >
          {props.children}
        </ServerSideConfigContext.Provider>
      </HydrateAtoms>
    </Provider>
  );
};
