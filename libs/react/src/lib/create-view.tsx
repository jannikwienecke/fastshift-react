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

export function createView<
  T extends keyof RegisteredRouter['config']['testType']
>(
  tableName: T,
  config: Partial<Omit<ViewConfigType<T>, 'viewFields' | 'tableName'>>,
  options: {
    Component: (props: {
      useList: typeof useList<GetTableDataType<T>>;
      data: QueryReturnOrUndefined<GetTableDataType<T>>;
    }) => React.ReactNode;
  }
): () => React.ReactNode {
  const _config = createViewConfig(tableName, config);

  return () => (
    <ViewDataProvider
      Component={options.Component}
      view={{
        viewConfigManager: new BaseViewConfigManager(_config.viewConfig),
      }}
    />
  );
}
