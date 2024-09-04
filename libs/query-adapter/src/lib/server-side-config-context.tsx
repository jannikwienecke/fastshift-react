'use client';

import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  clientConfigStore,
  DataModelNew,
  globalConfigAtom,
  IncludeConfig,
  makeData,
  QueryReturnDto,
  QueryStore,
  queryStoreAtom,
  RecordType,
  RegisteredViews,
  registeredViewsAtom,
  registeredViewsStore,
  viewConfigManagerAtom,
  ViewContextType,
} from '@apps-next/core';
import { Provider, useAtomValue } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';

import { queryDataAtom, useMutationAtom, useQueryAtom } from '@apps-next/react';
import React from 'react';
import { usePrismaQuery } from './use-prisma-query';
import { usePrismaMutation } from './use-prisma-mutation';

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

  const globalConfig = useAtomValue(globalConfigAtom);
  const registeredViewsClient = registeredViewsStore.get(registeredViewsAtom);

  const dataModel = makeData(
    props.registeredViews,
    viewConfigManager.getViewName()
  )(props.data ?? []);

  const relationalDataModel = Object.entries(
    props?.relationalData ?? {}
  ).reduce((acc, [tableName, data]) => {
    const viewConfig = props.registeredViews[tableName];
    acc[tableName] = makeData(
      props.registeredViews,
      viewConfig?.tableName
    )(data);
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
    viewName: viewConfigManager.getViewName(),
  };

  const combinedRegisteredViews = React.useMemo(() => {
    return {
      ...props.registeredViews,
      ...registeredViewsClient,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.registeredViews]);

  const initialValues = [
    [viewConfigManagerAtom, viewConfigManager],
    [registeredViewsAtom, combinedRegisteredViews],
    [globalConfigAtom, globalConfig],
    [queryStoreAtom, queryStore],
    [useQueryAtom, () => usePrismaQuery],
    [useMutationAtom, () => usePrismaMutation],
    [
      queryDataAtom,
      {
        data: props.data,
        relationalData: props.relationalData,
      },
    ],
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
