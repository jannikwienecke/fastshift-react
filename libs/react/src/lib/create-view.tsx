import {
  BaseViewConfigManager,
  createViewConfig,
  GetTableDataType,
  QueryReturnOrUndefined,
  RegisteredRouter,
  ViewConfigType,
} from '@apps-next/core';

import React from 'react';
import { useList } from './ui-adapter';
import { ViewDataProvider } from './view-provider';
import { useQuery } from './use-query';

export function createView<
  T extends keyof RegisteredRouter['config']['testType']
>(
  tableName: T,
  config: Partial<Omit<ViewConfigType<T>, 'viewFields' | 'tableName'>>,
  Component: (props: {
    useList: typeof useList<GetTableDataType<T>>;
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
  T extends keyof RegisteredRouter['config']['testType']
>(
  config: ViewConfigType<T>
) => {
  return {
    useList: useList<GetTableDataType<T>>,
    useQuery: useQuery<GetTableDataType<T>[]>,
  };
};
