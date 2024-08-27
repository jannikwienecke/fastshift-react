import {
  BaseViewConfigManager,
  createViewConfig,
  GetTableDataType,
  GetTableName,
  QueryReturnOrUndefined,
  RegisteredRouter,
  ViewConfigType,
} from '@apps-next/core';

import React from 'react';
import { useForm, useList } from './ui-adapter';
import { useQuery } from './use-query';
import { useQueryData } from './use-query-data';
import { ViewDataProvider } from './view-provider';

export function createView<
  T extends keyof RegisteredRouter['config']['_datamodel']
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

// export type DataType<
//   TConfig extends ViewConfigType,
//   TCustomDataType extends Record<string, any> | undefined = undefined
// > = TCustomDataType extends undefined
//   ? GetTableDataType<TConfig['tableName']>
//   : TCustomDataType & GetTableDataType<TConfig['tableName']>;

export type DataType<
  T extends GetTableName,
  TCustomDataType extends Record<string, any> | undefined = undefined
> = TCustomDataType extends undefined
  ? GetTableDataType<T>
  : TCustomDataType & GetTableDataType<T>;

export const makeHooks = <T extends DataType<any, any> | ViewConfigType>(
  viewConfig?: T
) => {
  type DataTypeToUse = T extends ViewConfigType
    ? GetTableDataType<T['tableName']>
    : T;

  return {
    useList: useList<DataTypeToUse>,
    useForm: useForm<DataTypeToUse>,
    useQuery: useQuery<DataTypeToUse[]>,
    useQueryData: useQueryData<DataTypeToUse[]>,
  };
};

export type GetViewProps<
  T extends keyof RegisteredRouter['config']['_datamodel']
> = Parameters<Parameters<typeof createView<T>>[2]>[0];
