'use client';

import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  QueryReturnOrUndefined,
  REGISTRED_VIEWS,
} from '@apps-next/core';
import React from 'react';
import { ViewContext } from './_internal/view-context';
import { useList } from './ui-adapter';
import { useGlobalConfig } from './use-global-config';
import { useQuery } from './use-query';

export const ViewProvider = ({
  children,
  view,
}: {
  children: React.ReactNode;
  view: { viewConfigManager: BaseViewConfigManagerInterface };
}) => {
  const { config } = useGlobalConfig();

  const { tableName } = view.viewConfigManager.viewConfig;

  const searchableFields = config.searchableFields[tableName];
  const viewFields = config.viewFields[tableName];

  const viewConfigManager = new BaseViewConfigManager(
    {
      ...view.viewConfigManager.viewConfig,
      viewFields,
      searchableFields,
    },
    {
      searchableFields,
      viewFields,
    }
  );

  return (
    <ViewContext.Provider
      value={{ viewConfigManager, registeredViews: REGISTRED_VIEWS }}
    >
      {children}
    </ViewContext.Provider>
  );
};

export const ViewDataProvider = <
  TProps extends {
    data: QueryReturnOrUndefined<any>;
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
    return <props.Component data={data} useList={useList} />;
  };

  const Provider = (
    <ViewProvider view={props.view}>
      <Content />
    </ViewProvider>
  );

  return Provider;
};
