'use client';

import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  globalConfigAtom,
  QueryReturnOrUndefined,
  REGISTRED_VIEWS,
  viewConfigManagerAtom,
  ViewConfigType,
} from '@apps-next/core';
import { useAtomValue } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import React from 'react';
import { ViewContext } from './_internal/view-context';
import { useForm, useList } from './ui-adapter';
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

  const viewConfig: ViewConfigType = {
    ...view.viewConfigManager.viewConfig,
    viewFields,
    includeFields,
    query: {
      searchableFields,
    },
  };

  const queryAdapter = useAtomValue(useQueryAtom);
  const mutationAdapter = useAtomValue(useMutationAtom);

  const viewConfigManager = new BaseViewConfigManager(viewConfig);

  return (
    <HydrateAtoms
      initialValues={[
        [viewConfigManagerAtom, viewConfigManager],
        [useQueryAtom, () => queryAdapter],
        [useMutationAtom, () => mutationAdapter],
      ]}
    >
      <ViewContext.Provider
        value={{ viewConfigManager, registeredViews: REGISTRED_VIEWS }}
      >
        {children}
      </ViewContext.Provider>
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

const HydrateAtoms = ({ initialValues, children }: any) => {
  useHydrateAtoms(initialValues, { dangerouslyForceHydrate: true });
  return children;
};
