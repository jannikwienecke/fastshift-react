import {
  BaseConfigInterface,
  BaseViewConfigManagerInterface,
  RegisteredViews,
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

export type QueryProviderConvexProps = {
  viewConfig: BaseViewConfigManagerInterface['viewConfig'];
  globalConfig: BaseConfigInterface;
  views: RegisteredViews;
  commands: UserStoreCommand[];
  userViewData?: UserViewData;
  queryKey: any[];
} & { children: React.ReactNode };

type QueryProviderPropsWithViewFieldsConfig = QueryProviderConvexProps & {
  uiViewConfig?: UiViewConfig;
  viewId: string | null;
};

export const ClientViewProviderConvex = (
  props: QueryProviderPropsWithViewFieldsConfig
) => {
  return <Content>{props.children}</Content>;
};

const Content = observer((props: { children: React.ReactNode }) => {
  // useQuery();
  useQueryData();
  const { runMutate, runMutateAsync } = useMutation();

  React.useLayoutEffect(() => {
    addEffects(store$);
    addLocalFiltering(store$);
    addLocalDisplayOptionsHandling(store$);

    store$.api.assign({
      mutate: runMutate,
      mutateAsync: runMutateAsync,
    });
  }, [runMutate, runMutateAsync]);

  return <> {props.children}</>;
});
