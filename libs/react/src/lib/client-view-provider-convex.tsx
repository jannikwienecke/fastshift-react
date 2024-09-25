'use client';

import {
  BaseConfigInterface,
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  DataModelNew,
  getViewByName,
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
import {
  clientConfigStore,
  clientViewConfigAtom,
  globalConfigAtom,
  registeredViewsAtom,
  viewConfigManagerAtom,
} from './stores';
import { HydrateAtoms } from './ui-components';

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
  const viewConfigManager = React.useMemo(
    () => new BaseViewConfigManager(props.viewConfig),
    [props.viewConfig]
  );

  const registeredViews = props.globalConfig.defaultViewConfigs;

  const views = React.useMemo(
    () => ({
      ...props.globalConfig.defaultViewConfigs,
      ...props.views,
    }),
    [props.globalConfig.defaultViewConfigs, props.views]
  );

  const queryClient = useQueryClient();

  const data = queryClient.getQueryData(
    makeQueryKey({
      viewName: viewConfigManager.getViewName(),
    })
  ) as QueryReturnOrUndefined;

  const dataModel = makeData(
    views,
    viewConfigManager.getTableName()
  )(data?.data ?? []);

  const relationalDataModel = Object.entries(data?.relationalData ?? {}).reduce(
    (acc, [tableName, data]) => {
      const viewConfig = getViewByName(registeredViews, tableName);

      acc[tableName] = makeData(registeredViews, viewConfig.viewName)(data);
      return acc;
    },
    {} as { [key: string]: DataModelNew<RecordType> }
  );

  const queryStore: QueryStore<RecordType> = React.useMemo(
    () => ({
      dataModel,
      relationalDataModel,
      loading: false,
      error: null,
      page: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      isInitialized: true,
      viewName: viewConfigManager.getViewName(),
    }),
    [dataModel, relationalDataModel, viewConfigManager]
  );

  const initialValues = React.useMemo(
    () => [
      [viewConfigManagerAtom, viewConfigManager],
      [registeredViewsAtom, views],
      [globalConfigAtom, props.globalConfig],
      [queryStoreAtom, queryStore],
      [clientViewConfigAtom, props.viewFieldsConfig],
    ],
    [
      viewConfigManager,
      views,
      props.globalConfig,
      queryStore,
      props.viewFieldsConfig,
    ]
  );

  return (
    <Provider key={viewConfigManager.getViewName()} store={clientConfigStore}>
      <HydrateAtoms
        key={viewConfigManager.getViewName()}
        initialValues={initialValues}
      >
        {props.children}
      </HydrateAtoms>
    </Provider>
  );
};
