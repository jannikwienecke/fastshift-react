'use client';

import {
  BaseConfigInterface,
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  Command,
  patchDict,
  QueryReturnOrUndefined,
  RegisteredViews,
  renderModelName,
  UiViewConfig,
} from '@apps-next/core';
import { observer } from '@legendapp/state/react';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { addEffects } from './legend-store';
import { store$ } from './legend-store/legend.store';
import { useMutation } from './use-mutation';
import { useQueryData } from './use-query-data';
import { t } from 'i18next';

export type QueryProviderConvexProps = {
  viewConfig: BaseViewConfigManagerInterface['viewConfig'];
  globalConfig: BaseConfigInterface;
  views: RegisteredViews;
  commands: Command[];
  queryKey: any[];
} & { children: React.ReactNode };

type QueryProviderPropsWithViewFieldsConfig = QueryProviderConvexProps & {
  uiViewConfig: UiViewConfig;
};

export const ClientViewProviderConvex = (
  props: QueryProviderPropsWithViewFieldsConfig
) => {
  const patechedViewFields = patchDict(props.viewConfig.viewFields, (f) => {
    // const translated = t(`${f.name}.edit`);
    // const noTranslation = translated === `${f.name}.edit`;

    // const isMany = f.relation?.type === 'manyToMany';
    // const translatedName = t(`${f.name}.${isMany ? 'other' : 'one'}`);
    // const noTranslationName =
    //   translatedName === `${f.name}.${isMany ? 'other' : 'one'}`;

    // const fieldLabelToUse = noTranslationName
    //   ? f.name.firstUpper()
    //   : translatedName;

    // const fallbackKey =
    //   f.relation?.type === 'manyToMany'
    //     ? 'changeOrAdd'
    //     : f.relation
    //     ? 'setField'
    //     : 'changeField';

    // const toUse = noTranslation
    //   ? t(`common.${fallbackKey}`, { field: fieldLabelToUse })
    //   : translated;

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

      // editLabel: f.editLabel || `${f.name}.edit`,
      // editSearchString: toUse
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
        };
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
        props.commands
      );
    }
  }, [data, props.uiViewConfig, viewConfigManager, views, props.commands]);

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

    store$.api.assign({
      mutate: runMutate,
      mutateAsync: runMutateAsync,
    });
  }, [runMutate, runMutateAsync]);

  return <> {props.children}</>;
});
