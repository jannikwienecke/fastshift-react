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

export const ViewProvider = ({
  children,
  viewConfigManager,
}: {
  children: React.ReactNode;
  viewConfigManager: BaseViewConfigManagerInterface;
}) => {
  return (
    <ViewContext.Provider value={{ viewConfigManager }}>
      {children}
    </ViewContext.Provider>
  );
};

export const ViewDataProvider = <
  TProps extends QueryReturnOrUndefined<any>
>(props: {
  Component: (props: TProps) => React.ReactNode;
  viewConfigManager: BaseViewConfigManager;
}) => {
  const _useQuery = (props: QueryProps) => {
    return useQuery<TProps[]>(props);
  };

  const Content = () => {
    const query = useAtomValue(debouncedQueryAtom);

    const data = _useQuery({
      query,
      viewConfigManager: props.viewConfigManager,
    });
    // eslint-disable-next-line
    // @ts-ignore
    return <props.Component {...data} />;
  };

  const Provider = (
    <ViewProvider viewConfigManager={props.viewConfigManager}>
      <Content />
    </ViewProvider>
  );

  return Provider;
};
