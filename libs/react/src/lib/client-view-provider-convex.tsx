'use client';

import {
  BaseConfigInterface,
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  DataModelNew,
  getViewByName,
  makeData,
  QueryReturnOrUndefined,
  RecordType,
  RegisteredViews,
  ViewFieldsConfig,
} from '@apps-next/core';
import { observer } from '@legendapp/state/react';
import { useQueryClient } from '@tanstack/react-query';
import { Provider } from 'jotai';
import React from 'react';
import { addEffects } from './legend-store';
import { store$ } from './legend-store/legend.store';
import { QueryStore, queryStoreAtom } from './query-store';
import {
  clientConfigStore,
  clientViewConfigAtom,
  globalConfigAtom,
  registeredViewsAtom,
  viewConfigManagerAtom,
} from './stores';
import { HydrateAtoms } from './ui-components';
import { useComboboxQuery } from './use-combobox-query';
import { useMutation } from './use-mutation';
import { useQuery } from './use-query';
import { useQueryData } from './use-query-data';

export type QueryProviderConvexProps = {
  viewConfig: BaseViewConfigManagerInterface['viewConfig'];
  globalConfig: BaseConfigInterface;
  views: RegisteredViews;
  queryKey: any[];
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

  const views = React.useMemo(
    () => ({
      ...props.globalConfig.defaultViewConfigs,
      ...props.views,
    }),
    [props.globalConfig.defaultViewConfigs, props.views]
  );

  const queryClient = useQueryClient();

  const data = queryClient.getQueryData(
    props.queryKey
  ) as QueryReturnOrUndefined;

  store$.init(
    data?.data ?? [],
    data?.relationalData ?? {},
    viewConfigManager,
    views,
    props.viewFieldsConfig
  );

  return (
    <Provider key={viewConfigManager.getViewName()} store={clientConfigStore}>
      <Content>{props.children}</Content>
    </Provider>
  );
};

const Content = observer((props: { children: React.ReactNode }) => {
  useQuery();
  useComboboxQuery();
  useQueryData();
  const { runMutate, runMutateAsync } = useMutation();

  React.useLayoutEffect(() => {
    store$.api.assign({
      mutate: runMutate,
      mutateAsync: runMutateAsync,
    });
  }, [runMutate, runMutateAsync]);

  addEffects(store$);

  return <> {props.children}</>;
});
