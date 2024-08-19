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

// export type GetTableName = RegisteredRouter['config']['tableNames'][number];

// export type GetTableDataType<T extends GetTableName> =
//   // ReturnType<RegisteredPrisma['prisma'][T]['findFirstOrThrow']>
//   RegisteredRouter['config']['testType'][T];

// export function createView<
//   TView extends ViewConfig<any, T>,
//   T extends GetTableName,
//   TOptions extends {
//     Component?: (props: {
//       useList: typeof useList<GetTableDataType<TView['tableName']>>;
//       data: QueryReturnOrUndefined<GetTableDataType<TView['tableName']>>;
//     }) => React.ReactNode;
//   } | null,
//   ReturnTypeX = TOptions extends { Component?: React.FC<any> }
//     ? () => React.ReactNode
//     : {
//         useList: typeof useList<GetTableDataType<TView['tableName']>>;
//         useQuery: typeof useQuery<GetTableDataType<TView['tableName']>[]>;
//         viewConfigManager: BaseViewConfigManager;
//       }
// >(viewConfig: TView, options: TOptions): ReturnTypeX {
//   if (options?.Component) {
//     const Value = (() => (
//       <ViewDataProvider
//         Component={options.Component!}
//         view={{
//           viewConfigManager: new BaseViewConfigManager(viewConfig),
//         }}
//       />
//     )) as ReturnTypeX;

//     return Value;
//   } else {
//     return {
//       useList: useList<GetTableDataType<TView['tableName']>>,
//       useQuery: useQuery<GetTableDataType<TView['tableName']>[]>,
//       viewConfigManager: new BaseViewConfigManager(viewConfig),
//     } as ReturnTypeX;
//   }
// }

export function createView<
  T extends keyof RegisteredRouter['config']['testType']
>(
  tableName: T,
  config: Partial<
    Omit<
      ViewConfigType<RegisteredRouter['config']['testType'], T>,
      'viewFields' | 'tableName'
    >
  >,
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
