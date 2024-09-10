'use client';

import {
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

import { useQueryClient } from '@tanstack/react-query';
import { Provider } from 'jotai';
import React from 'react';
import { QueryStore, queryStoreAtom } from './query-store';
import { HydrateAtoms } from './ui-components';
import {
  viewConfigManagerAtom,
  registeredViewsAtom,
  globalConfigAtom,
  clientViewConfigAtom,
  clientConfigStore,
} from './stores';

export type QueryProviderConvexProps = {
  viewConfig: BaseViewConfigManagerInterface['viewConfig'];
  globalConfig: BaseConfigInterface;
  views: RegisteredViews;
} & { children: React.ReactNode };

type QueryProviderPropsWithViewFieldsConfig = QueryProviderConvexProps & {
  viewFieldsConfig: ViewFieldsConfig;
};

export const ClientViewProviderConvex = (
  props: QueryProviderPropsWithViewFieldsConfig
) => {
  const viewConfigManager = new BaseViewConfigManager(props.viewConfig);

  const registeredViews = props.globalConfig.defaultViewConfigs;

  const views = {
    ...props.globalConfig.defaultViewConfigs,
    ...props.views,
  };

  const queryClient = useQueryClient();

  const data = queryClient.getQueryData(
    makeQueryKey({
      viewName: viewConfigManager.getViewName(),
    })
  ) as QueryReturnOrUndefined;

  const dataModel = makeData(
    views,
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
    [registeredViewsAtom, views],
    [globalConfigAtom, props.globalConfig],
    [queryStoreAtom, queryStore],
    [clientViewConfigAtom, props.viewFieldsConfig],
  ];

  return (
    <Provider store={clientConfigStore}>
      <HydrateAtoms
        key={viewConfigManager.getViewName()}
        initialValues={initialValues}
      >
        {props.children}
      </HydrateAtoms>
    </Provider>
  );
};
