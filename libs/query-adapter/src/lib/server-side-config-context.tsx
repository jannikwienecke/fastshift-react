'use client';

import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  clientConfigStore,
  DataModelNew,
  GlobalConfig,
  IncludeConfig,
  makeData,
  Model,
  QueryReturnDto,
  QueryStore,
  queryStoreAtom,
  RecordType,
  RegisteredViews,
  registeredViewsAtom,
  setGlobalConfigAtom,
  viewConfigManagerAtom,
  ViewContextType,
} from '@apps-next/core';
import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';

import React from 'react';

const HydrateAtoms = ({ initialValues, children }: any) => {
  useHydrateAtoms(initialValues, { dangerouslyForceHydrate: true });
  return children;
};

export const ServerSideConfigContext = React.createContext<ViewContextType>(
  {} as ViewContextType
);

// used in apps like nextjs when prefetching data and creating
// the view config in the server.
// Used together with QueryPrefetchProvider
export const ServerSideConfigProvider = (
  props: {
    viewConfig: BaseViewConfigManagerInterface['viewConfig'];
    registeredViews: RegisteredViews;
    includeConfig: IncludeConfig;
    data: QueryReturnDto['data'];
    relationalData?: QueryReturnDto['relationalData'];
  } & { children: React.ReactNode }
) => {
  const viewConfigManager = new BaseViewConfigManager(props.viewConfig);

  const dataModel = makeData(
    props.registeredViews,
    viewConfigManager.getViewName()
  )(props.data ?? []);

  const relationalDataModel = Object.entries(
    props?.relationalData ?? {}
  ).reduce((acc, [key, data]) => {
    acc[key] = makeData(props.registeredViews, key)(data);
    return acc;
  }, {} as { [key: string]: DataModelNew<RecordType> });

  const queryStore: QueryStore<RecordType> = {
    dataModel,
    relationalDataModel,
    loading: false,
    error: null,
    page: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    isInitialized: true,
  };

  const initialValues = [
    [viewConfigManagerAtom, viewConfigManager],
    [registeredViewsAtom, props.registeredViews],
    [setGlobalConfigAtom, {} as GlobalConfig],
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
            registeredViews: props.registeredViews,
          }}
        >
          {props.children}
        </ServerSideConfigContext.Provider>
      </HydrateAtoms>
    </Provider>
  );
};
