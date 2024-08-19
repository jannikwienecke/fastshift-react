import React from 'react';
import { ViewContext } from './_internal/view-context';
import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  QueryProps,
  QueryReturnOrUndefined,
} from '@apps-next/core';
import { useQuery } from './use-query';
import { useAtomValue } from 'jotai';
import { debouncedQueryAtom } from './ui-components/query-input';
import { useList } from './ui-adapter';
import { usePrismaApi } from 'query-adapter/src/lib/use-prisma-api';

export const ViewProvider = ({
  children,
  view,
}: {
  children: React.ReactNode;
  view: { viewConfigManager: BaseViewConfigManagerInterface };
}) => {
  return (
    <ViewContext.Provider value={{ viewConfigManager: view.viewConfigManager }}>
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
  const _useQuery = (props: QueryProps) => {
    return useQuery<TProps[]>(props);
  };

  const Content = () => {
    const query = useAtomValue(debouncedQueryAtom);
    const data = _useQuery({
      query,
    });

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
