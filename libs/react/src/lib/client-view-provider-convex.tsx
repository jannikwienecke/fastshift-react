'use client';

import {
  BaseConfigInterface,
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  Command,
  FieldConfig,
  patchDict,
  QueryReturnOrUndefined,
  RegisteredViews,
  renderModelName,
  UiViewConfig,
  UserViewData,
} from '@apps-next/core';
import { observer } from '@legendapp/state/react';
import { useQueryClient } from '@tanstack/react-query';
import { t } from 'i18next';
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
  commands: Command[];
  userViewData: UserViewData;
  queryKey: any[];
} & { children: React.ReactNode };

type QueryProviderPropsWithViewFieldsConfig = QueryProviderConvexProps & {
  uiViewConfig: UiViewConfig;
};

export const ClientViewProviderConvex = (
  props: QueryProviderPropsWithViewFieldsConfig
) => {
  const patechedViewFields = patchDict(props.viewConfig.viewFields, (f) => {
    const userFieldConfig = props.viewConfig.fields?.[f.name];
    const displayFIeld = props.viewConfig.displayField.field;
    const softDeleteField = props.viewConfig.mutation?.softDeleteField;

    const hideFieldFromForm = softDeleteField && softDeleteField === f.name;
    const isDisplayField =
      displayFIeld && f.name === displayFIeld ? true : undefined;

    return {
      ...f,
      ...(userFieldConfig ?? {}),
      label: f.label || `${f.name}.one`,
      isDisplayField: isDisplayField as true | undefined,
      editLabel: `${f.name}.edit`,
      hideFromForm: hideFieldFromForm || userFieldConfig?.hideFromForm,
    };
  });

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
      viewFields: patchDict(view.viewFields, (f) => {
        const userFieldConfig = props.viewConfig.fields?.[f.name];
        const displayFIeld = props.viewConfig.displayField.field;
        const softDeleteField = props.viewConfig.mutation?.softDeleteField;

        const hideFieldFromForm = softDeleteField && softDeleteField === f.name;
        const isDisplayField =
          displayFIeld && f.name === displayFIeld ? true : undefined;

        return {
          ...f,
          ...userFieldConfig,
          isDisplayField,
          label: f.label || renderModelName(f.name, t),
          hideFromForm: hideFieldFromForm || userFieldConfig?.hideFromForm,
        } satisfies FieldConfig;
      }),
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
        data?.continueCursor ?? null,
        data?.isDone ?? false,
        viewConfigManager,
        views,
        props.uiViewConfig,
        props.commands,
        props.userViewData
      );
    }
  }, [
    data,
    props.uiViewConfig,
    viewConfigManager,
    views,
    props.commands,
    props.userViewData,
  ]);

  if (!isInitialized) {
    return null;
  }
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
