'use client';

import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  clientConfigStore,
  GlobalConfig,
  IncludeConfig,
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
    relationalDataRaw: QueryReturnDto['relationalData'];
  } & { children: React.ReactNode }
) => {
  const viewConfigManager = new BaseViewConfigManager(props.viewConfig);

  const model = Model.create(
    props.data ?? [],
    viewConfigManager,
    props.registeredViews
  );

  const relationalDataModel = Object.entries(
    props.relationalDataRaw ?? {}
  ).reduce((acc, [key, data]) => {
    acc[key] = Model.create(data, viewConfigManager, props.registeredViews);
    return acc;
  }, {} as { [key: string]: Model<RecordType> });

  const queryStore: QueryStore<RecordType> = {
    dataRaw: props.data || [],
    dataModel: model,
    relationalDataRaw: props.relationalDataRaw ?? {},
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
