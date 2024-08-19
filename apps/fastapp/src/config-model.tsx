// import {
//   // GetTableDataType,
//   GetTableName,
// } from '@apps-next/convex-adapter-app';
// import {
//   ConvexViewConfig,
//   RegisteredRouter,
//   ViewFieldConfig,
// } from '@apps-next/core';

// export function _createViewConfigManger<T extends GetTableName>(
//   tableName: T,
//   config: Partial<
//     Omit<
//       ConvexViewConfig<RegisteredRouter['config']['dataModel'], T>,
//       'viewFields' | 'tableName'
//     >
//   >
// ) {
//   const viewFields = {} as ViewFieldConfig;
//   const searchableFields = {} as any;

//   const viewConfig: ConvexViewConfig<
//     RegisteredRouter['config']['dataModel'],
//     T
//   > = {
//     ...config,
//     dbProvider: 'convex',
//     displayField: {
//       ...config.displayField,
//       field: config.displayField?.field as any,
//     },
//     viewFields: viewFields,
//     tableName: tableName,
//     viewName: config.viewName ?? (tableName as string),
//     query: {
//       searchableFields: searchableFields,
//     },
//   };

//   return viewConfig;
// }

// // export function _createViewNew<
// //   TView extends ViewConfig<any, T>,
// //   T extends GetTableName,
// //   TOptions extends {
// //     Component?: (props: {
// //       useList: typeof useList<GetTableDataType<TView['tableName']>>;
// //       data: QueryReturnOrUndefined<GetTableDataType<TView['tableName']>>;
// //     }) => React.ReactNode;
// //   } | null,
// //   ReturnTypeX = TOptions extends { Component?: React.FC<any> }
// //     ? () => React.ReactNode
// //     : {
// //         useList: typeof useList<GetTableDataType<TView['tableName']>>;
// //         useQuery: typeof useQuery<GetTableDataType<TView['tableName']>[]>;
// //         viewConfigManager: BaseViewConfigManager;
// //         test: RegisteredRouter['config'];
// //       }
// // >(viewConfig: TView, options: TOptions): ReturnTypeX {
// //   if (options?.Component) {
// //     const Value = (() => (
// //       <ViewDataProvider
// //         Component={options.Component!}
// //         view={{
// //           viewConfigManager: new BaseViewConfigManager(viewConfig),
// //         }}
// //       />
// //     )) as ReturnTypeX;

// //     return Value;
// //   } else {
// //     return {
// //       useList: useList<GetTableDataType<TView['tableName']>>,
// //       useQuery: useQuery<GetTableDataType<TView['tableName']>[]>,
// //       viewConfigManager: new BaseViewConfigManager(viewConfig),
// //       test: {} as RegisteredRouter['config'],
// //     } as ReturnTypeX;
// //   }
// // }

// // export function _createView<
// //   T extends GetTableName,
// //   TOptions extends {
// //     Component?: (props: {
// //       useList: typeof useList<GetTableDataType<T>>;
// //       data: QueryReturnOrUndefined<GetTableDataType<T>>;
// //     }) => React.ReactNode;
// //   } | null,
// //   ReturnTypeX = TOptions extends { Component?: React.FC<any> }
// //     ? () => React.ReactNode
// //     : {
// //         useList: typeof useList<GetTableDataType<T>>;
// //         useQuery: typeof useQuery<GetTableDataType<T>[]>;
// //         viewConfigManager: ConvexViewConfigManager;
// //       }
// // >(
// //   tableName: T,
// //   config: Partial<
// //     Omit<
// //       ConvexViewConfig<RegisteredRouter['config']['dataModel'], T>,
// //       'viewFields' | 'tableName'
// //     >
// //   >,
// //   options: TOptions
// // ): ReturnTypeX {
// //   const viewFields = {} as ViewFieldConfig;
// //   const searchableFields = {} as any;

// //   const viewConfig: ConvexViewConfig<RegisteredRouter['config']['dataModel']> =
// //     {
// //       ...config,
// //       dbProvider: 'convex',
// //       displayField: {
// //         ...config.displayField,
// //         field: config.displayField?.field as any,
// //       },
// //       viewFields: viewFields,
// //       tableName,
// //       viewName: config.viewName ?? (tableName as string),
// //       query: {
// //         searchableFields: searchableFields,
// //       },
// //     };

// //   const viewConfigManager = new ConvexViewConfigManager(viewConfig);

// //   if (options?.Component) {
// //     return (
// //       <ViewDataProvider
// //         Component={options.Component}
// //         view={{ viewConfigManager }}
// //       />
// //     ) as ReturnTypeX;
// //   } else {
// //     return {
// //       useList: useList<GetTableDataType<T>>,
// //       useQuery: useQuery<GetTableDataType<T>[]>,
// //       viewConfigManager,
// //     } as ReturnTypeX;
// //   }
// // }
