import {
  ConvexViewConfigManager,
  GetTableDataType,
  GetTableName,
} from '@apps-next/convex-adapter-app';
import {
  ConvexViewConfig,
  QueryReturnOrUndefined,
  RegisteredRouter,
  ViewFieldConfig,
} from '@apps-next/core';
import { useList, useQuery, ViewDataProvider } from '@apps-next/react';
import React from 'react';

// // type GetTableDataType<
// //   T extends keyof RegisteredRouter['config']['dataModel']['tables']
// // > = Merge<
// //   Infer<RegisteredRouter['config']['dataModel']['tables'][T]['validator']>,
// //   {
// //     id: string;
// //   }
// // >;

// // type Merge<T, U> = {
// //   [K in keyof T | keyof U]: K extends keyof U
// //     ? U[K]
// //     : K extends keyof T
// //     ? T[K]
// //     : never;
// // };

// type GetTableName = keyof RegisteredRouter['config']['dataModel']['tables'];

// // export function createView<T extends GetTableName>(
// //   tableName: T,
// //   config: Partial<
// //     Omit<
// //       ConvexViewConfig<RegisteredRouter['config']['dataModel'], T>,
// //       'viewFields' | 'tableName'
// //     >
// //   >,
// //   {
// //     Component,
// //   }: {
// //     Component: (props: {
// //       // @ts-ignore
// //       useList: typeof useList<GetTableDataType<T>>;

// //       data: QueryReturnOrUndefined<GetTableDataType<T>>;
// //     }) => React.ReactNode;
// //   }
// // ): React.ReactNode {
// //   const viewFields = {} as ViewFieldConfig;
// //   const searchableFields = {} as any;

// //   const viewConfig: ConvexViewConfig<
// //     RegisteredRouter['config']['dataModel'],
// //     T
// //   > = {
// //     ...config,
// //     dbProvider: 'convex',
// //     displayField: {
// //       ...config.displayField,
// //       field: config.displayField?.field as any,
// //     },
// //     viewFields: viewFields,
// //     tableName,
// //     viewName: config.viewName ?? (tableName as string),
// //     query: {
// //       searchableFields: searchableFields,
// //     },
// //   };

// //   const viewConfigManager = new ConvexViewConfigManager(viewConfig);

// //   return (
// //     <>
// //       <ViewDataProvider Component={Component} view={{ viewConfigManager }} />
// //     </>
// //   );
// // }

export function _createView<
  T extends GetTableName,
  TOptions extends {
    Component?: (props: {
      useList: typeof useList<GetTableDataType<T>>;
      data: QueryReturnOrUndefined<GetTableDataType<T>>;
    }) => React.ReactNode;
  } | null,
  ReturnTypeX = TOptions extends { Component?: React.FC<any> }
    ? React.ReactNode
    : {
        useList: typeof useList<GetTableDataType<T>>;
        useQuery: typeof useQuery<GetTableDataType<T>[]>;
        viewConfigManager: ConvexViewConfigManager;
      }
>(
  tableName: T,
  config: Partial<
    Omit<
      ConvexViewConfig<RegisteredRouter['config']['dataModel'], T>,
      'viewFields' | 'tableName'
    >
  >,
  options: TOptions
): ReturnTypeX {
  const viewFields = {} as ViewFieldConfig;
  const searchableFields = {} as any;

  const viewConfig: ConvexViewConfig<
    RegisteredRouter['config']['dataModel'],
    T
  > = {
    ...config,
    dbProvider: 'convex',
    displayField: {
      ...config.displayField,
      field: config.displayField?.field as any,
    },
    viewFields: viewFields,
    tableName,
    viewName: config.viewName ?? (tableName as string),
    query: {
      searchableFields: searchableFields,
    },
  };

  const viewConfigManager = new ConvexViewConfigManager(viewConfig);

  if (options?.Component) {
    return (
      <ViewDataProvider
        Component={options.Component}
        view={{ viewConfigManager }}
      />
    ) as ReturnTypeX;
  } else {
    return {
      useList: useList<GetTableDataType<T>>,
      useQuery: useQuery<GetTableDataType<T>[]>,
      viewConfigManager,
    } as ReturnTypeX;
  }
}
