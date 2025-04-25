import {
  BaseConfigInterface,
  BaseViewConfigManagerInterface,
  FieldConfig,
  patchDict,
  RegisteredViews,
  renderModelName,
  t,
  UiViewConfig,
  UserStoreCommand,
  UserViewData,
} from '@apps-next/core';
import { observer } from '@legendapp/state/react';
import React from 'react';
import { addEffects, addLocalFiltering } from './legend-store';
import { addLocalDisplayOptionsHandling } from './legend-store/legend.local.display-options';
import { store$ } from './legend-store/legend.store';
import { useMutation } from './use-mutation';
import { useQueryData } from './use-query-data';
import { useQueryClient } from '@tanstack/react-query';
import { useApi } from './use-api';

export type QueryProviderConvexProps = {
  commands: UserStoreCommand[];
} & { children: React.ReactNode };

export const ClientViewProviderConvex = (props: QueryProviderConvexProps) => {
  const runOnce = React.useRef(false);

  if (!runOnce.current) {
    runOnce.current = true;
  }

  return <Content>{props.children}</Content>;
};

const Content = observer((props: { children: React.ReactNode }) => {
  useQueryData();

  const { runMutate, runMutateAsync } = useMutation();
  const { makeQueryOptions } = useApi();

  const queryClient = useQueryClient();

  React.useLayoutEffect(() => {
    addEffects(store$);
    addLocalFiltering(store$);
    addLocalDisplayOptionsHandling(store$);

    store$.api.assign({
      mutate: runMutate,
      mutateAsync: runMutateAsync,
      queryClient,
      makeQueryOptions,
    });
  }, [makeQueryOptions, queryClient, runMutate, runMutateAsync]);

  return <> {props.children}</>;
});
