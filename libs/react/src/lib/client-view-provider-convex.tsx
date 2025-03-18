'use client';

import {
  BaseConfigInterface,
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  patchDict,
  QueryReturnOrUndefined,
  RegisteredViews,
  renderModelName,
  t,
  UiViewConfig,
} from '@apps-next/core';
import { observer } from '@legendapp/state/react';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { addEffects } from './legend-store';
import { store$ } from './legend-store/legend.store';
import { useMutation } from './use-mutation';
import { useQueryData } from './use-query-data';

export type QueryProviderConvexProps = {
  viewConfig: BaseViewConfigManagerInterface['viewConfig'];
  globalConfig: BaseConfigInterface;
  views: RegisteredViews;
  queryKey: any[];
} & { children: React.ReactNode };

type QueryProviderPropsWithViewFieldsConfig = QueryProviderConvexProps & {
  uiViewConfig: UiViewConfig;
};

export const ClientViewProviderConvex = (
  props: QueryProviderPropsWithViewFieldsConfig
) => {
  const patechedViewFields = patchDict(props.viewConfig.viewFields, (f) => ({
    ...f,
    label: f.label || `${f.name}.one`,
  }));

  console.log(props);
  const viewConfigManager = React.useMemo(
    () =>
      new BaseViewConfigManager(
        {
          ...props.viewConfig,
          viewFields: patechedViewFields,
        },
        props.uiViewConfig
      ),
    [props.viewConfig, patechedViewFields, props.uiViewConfig]
  );

  let views = React.useMemo(
    () => ({
      ...props.globalConfig.defaultViewConfigs,
      ...props.views,
    }),
    [props.globalConfig.defaultViewConfigs, props.views]
  );

  views = patchDict(views ?? {}, (view) => {
    if (!view) return view;

    return {
      ...view,
      viewFields: patchDict(view.viewFields, (f) => ({
        ...f,
        label: f.label || renderModelName(f.name, t),
      })),
    };
  });

  const queryClient = useQueryClient();

  const data = queryClient.getQueryData(
    props.queryKey
  ) as QueryReturnOrUndefined;

  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useLayoutEffect(() => {
    setIsInitialized(true);
    if (data && props.uiViewConfig && viewConfigManager && views) {
      store$.init(
        data?.data ?? [],
        data?.relationalData ?? {},
        viewConfigManager,
        views,
        props.uiViewConfig
      );
    }
  }, [data, props.uiViewConfig, viewConfigManager, views]);

  if (!isInitialized) return null;
  return <Content>{props.children}</Content>;
};

const Content = observer((props: { children: React.ReactNode }) => {
  // useQuery();
  useQueryData();
  const { runMutate, runMutateAsync } = useMutation();

  React.useLayoutEffect(() => {
    addEffects(store$);

    store$.api.assign({
      mutate: runMutate,
      mutateAsync: runMutateAsync,
    });
  }, [runMutate, runMutateAsync]);

  return <> {props.children}</>;
});
