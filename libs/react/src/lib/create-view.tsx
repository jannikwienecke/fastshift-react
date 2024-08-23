import {
  BaseViewConfigManager,
  createViewConfig,
  GetTableDataType,
  QueryReturnOrUndefined,
  RegisteredRouter,
  ViewConfigType,
} from '@apps-next/core';

import React from 'react';
import { useForm, useList } from './ui-adapter';
import { ViewDataProvider } from './view-provider';
import { useQuery } from './use-query';

export function createView<
  T extends keyof RegisteredRouter['config']['testType']
>(
  tableName: T,
  config: Partial<Omit<ViewConfigType<T>, 'viewFields' | 'tableName'>>,
  Component: (props: {
    useList: typeof useList<GetTableDataType<T>>;
    useForm: typeof useForm<GetTableDataType<T>>;
    data: QueryReturnOrUndefined<GetTableDataType<T>>;
  }) => React.ReactNode
): () => React.ReactNode {
  const _config = createViewConfig(tableName, config);

  return () => (
    <ViewDataProvider
      Component={Component}
      view={{
        viewConfigManager: new BaseViewConfigManager(_config),
      }}
    />
  );
}

export const makeHooks = <
  T extends keyof RegisteredRouter['config']['testType'],
  TCustomDataType extends Record<string, any> | undefined = undefined
>(
  config: ViewConfigType<T>
) => {
  type DataType = TCustomDataType extends undefined
    ? GetTableDataType<T>
    : TCustomDataType & GetTableDataType<T>;

  return {
    useList: useList<DataType>,
    useForm: useForm<DataType>,
    useQuery: useQuery<DataType[]>,
  };
};

export type GetViewProps<
  T extends keyof RegisteredRouter['config']['testType']
> = Parameters<Parameters<typeof createView<T>>[2]>[0];
