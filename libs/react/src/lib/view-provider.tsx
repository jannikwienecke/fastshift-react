'use client';

import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  globalConfigAtom,
  mergeRegisteredViews,
  QueryReturnOrUndefined,
  registeredViewsAtom,
  registeredViewsServerAtom,
  viewConfigManagerAtom,
  ViewConfigType,
} from '@apps-next/core';
import { useAtomValue } from 'jotai';
import React from 'react';
import { useForm, useList } from './ui-adapter';
import { HydrateAtoms } from './ui-components';
import { useMutationAtom } from './use-mutation';
import { useQuery, useQueryAtom } from './use-query';

export const ViewProvider = ({
  children,
  view,
}: {
  children: React.ReactNode;
  view: { viewConfigManager: BaseViewConfigManagerInterface };
}) => {
  const { tableName } = view.viewConfigManager.viewConfig;
  const config = useAtomValue(globalConfigAtom);

  const searchableFields = config.searchableFields[tableName];
  const viewFields = config.viewFields[tableName];
  const includeFields = config.includeFields[tableName];

  const registeredViewsClient = useAtomValue(registeredViewsAtom);
  const registeredViews = useAtomValue(registeredViewsServerAtom);

  const viewConfig: ViewConfigType = React.useMemo(() => {
    return {
      ...view.viewConfigManager.viewConfig,
      viewFields,
      includeFields,
      query: {
        searchableFields,
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchedRegisteredViews = React.useMemo(() => {
    return {
      ...mergeRegisteredViews(registeredViews, registeredViewsClient),
      [viewConfig.viewName || '']: viewConfig,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const queryAdapter = useAtomValue(useQueryAtom);
  const mutationAdapter = useAtomValue(useMutationAtom);

  const viewConfigManager = new BaseViewConfigManager(viewConfig);

  return (
    <HydrateAtoms
      initialValues={[
        [viewConfigManagerAtom, viewConfigManager],
        [useQueryAtom, () => queryAdapter],
        [useMutationAtom, () => mutationAdapter],
        [registeredViewsAtom, patchedRegisteredViews],
      ]}
    >
      {children}
    </HydrateAtoms>
  );
};

export const ViewDataProvider = <
  TProps extends {
    data: QueryReturnOrUndefined;
    useList: typeof useList;
  }
>(props: {
  Component: (props: TProps) => React.ReactNode;
  view: { viewConfigManager: BaseViewConfigManager };
}) => {
  const Content = () => {
    const data = useQuery<TProps[]>();

    // eslint-disable-next-line
    // @ts-ignore
    return <props.Component data={data} useList={useList} useForm={useForm} />;
  };

  const Provider = (
    <ViewProvider view={props.view}>
      <Content />
    </ViewProvider>
  );

  return Provider;
};
