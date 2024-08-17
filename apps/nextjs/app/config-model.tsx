// import {
//   ConvexSchemaType,
//   ConvexViewConfigManager,
// } from '@apps-next/convex-adapter-app';
// import {
//   ConvexViewConfig,
//   QueryReturnOrUndefined,
//   ViewFieldConfig,
// } from '@apps-next/core';
// import { useList, useQuery, ViewDataProvider } from '@apps-next/react';
// import { Infer } from 'convex/values';
// import React from 'react';
// import { RegisteredRouter } from './second';
// import { BaseConfigInterface } from './type.root';

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

// // type GetTableName = keyof RegisteredRouter['config']['dataModel']['tables'];

// // export const useStableQuery = <
// //   T extends keyof RegisteredRouter['config']['dataModel']['tables']
// // >(
// //   table: T,
// //   fn: any,
// //   args: any
// // ) => {
// //   const result = useQueryTanstack(convexQuery(fn, args));

// //   const stored = React.useRef(result);

// //   if (result.data !== undefined) {
// //     stored.current = result;
// //   }

// //   type DataType = Infer<
// //     RegisteredRouter['config']['dataModel']['tables'][T]['validator']
// //   >;

// //   type DataTypeWithId = DataType & { id: string };

// //   return stored.current as {
// //     data: DataTypeWithId[];
// //     isLoading: boolean;
// //     isError: boolean;
// //   };
// // };

// // export class ConvexConfig<T extends ConvexSchemaType> {
// //   config: BaseConfigInterface<T, keyof T['tables']>;
// //   constructor(
// //     public schema: T,
// //     private ui: {
// //       Provider: typeof ViewDataProvider;
// //     } = {
// //       Provider: ViewDataProvider,
// //     }
// //   ) {
// //     this.config = {
// //       dataModel: schema,
// //       tableNames: Object.keys(schema.tables),
// //     };
// //   }

// //   createView<T extends keyof RegisteredRouter['config']['dataModel']['tables']>(
// //     modelName: T,
// //     {
// //       Component,
// //     }: {
// //       Component: (
// //         props: QueryReturnOrUndefined<
// //           // this works -> not sure why typescript is complaining
// //           // @ts-ignore
// //           Infer<
// //             RegisteredRouter['config']['dataModel']['tables'][T]['validator']
// //           > & {
// //             id: string;
// //           }
// //         >
// //       ) => React.ReactNode;
// //     }
// //   ) {
// //     return (
// //       <>
// //         <ViewDataProvider Component={Component} viewConfigManager={{} as any} />
// //       </>
// //     );
// //   }
// // }

// // export class ConfigWithouUi<T extends ConvexSchemaType> {
// //   config: BaseConfigInterface<T, keyof T['tables']>;
// //   constructor(
// //     public schema: T,
// //     private ui: {
// //       Provider: typeof ViewDataProvider;
// //     } = {
// //       Provider: ViewDataProvider,
// //     }
// //   ) {
// //     this.config = {
// //       dataModel: schema,
// //       tableNames: Object.keys(schema.tables),
// //     };
// //   }
// // }

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
// //       <ViewDataProvider
// //         Component={Component}
// //         viewConfigManager={viewConfigManager}
// //       />
// //     </>
// //   );
// // }

// // export function _createView<T extends GetTableName>(
// //   tableName: T,
// //   config: Partial<
// //     Omit<
// //       ConvexViewConfig<RegisteredRouter['config']['dataModel'], T>,
// //       'viewFields' | 'tableName'
// //     >
// //   >,
// //   options?: {
// //     Component?: (props: {
// //       // @ts-ignore
// //       useList: typeof useList<GetTableDataType<T>>;

// //       data: QueryReturnOrUndefined<GetTableDataType<T>>;
// //     }) => React.ReactNode;
// //   }
// // ): React.ReactNode;

// // export function _createView<T extends GetTableName>(
// //   tableName: T,
// //   config: Partial<
// //     Omit<
// //       ConvexViewConfig<RegisteredRouter['config']['dataModel'], T>,
// //       'viewFields' | 'tableName'
// //     >
// //   >
// // ): {
// //   useList: typeof useList<GetTableDataType<T>>;
// //   useQuery: typeof useQuery<GetTableDataType<T>[]>;
// // };

// export function _createView<
//   T extends GetTableName,
//   TOptions extends {
//     Component?: (props: {
//       useList: typeof useList<GetTableDataType<T>>;
//       data: QueryReturnOrUndefined<GetTableDataType<T>>;
//     }) => React.ReactNode;
//   } | null,
//   ReturnTypeX = TOptions extends { Component?: React.FC<any> }
//     ? React.ReactNode
//     : {
//         useList: typeof useList<GetTableDataType<T>>;
//         useQuery: typeof useQuery<GetTableDataType<T>[]>;
//       }
// >(
//   tableName: T,
//   config: Partial<
//     Omit<
//       ConvexViewConfig<RegisteredRouter['config']['dataModel'], T>,
//       'viewFields' | 'tableName'
//     >
//   >,
//   options: TOptions
// ): ReturnTypeX {
//   const viewFields = {} as ViewFieldConfig;
//   const searchableFields = {} as any;

//   const viewConfig: ConvexViewConfig<
//     RegisteredRouter['config']['dataModel'],
//     T
//   > = {
//     ...config,
//     displayField: {
//       ...config.displayField,
//       field: config.displayField?.field as any,
//     },
//     viewFields: viewFields,
//     tableName,
//     viewName: config.viewName ?? (tableName as string),
//     query: {
//       searchableFields: searchableFields,
//     },
//   };

//   const viewConfigManager = new ConvexViewConfigManager(viewConfig);

//   if (options?.Component) {
//     return (
//       <>
//         <ViewDataProvider
//           Component={options.Component}
//           viewConfigManager={viewConfigManager}
//         />
//       </>
//     ) as ReturnTypeX;
//   } else {
//     return {
//       useList: useList<GetTableDataType<T>>(),
//       useQuery: useQuery<GetTableDataType<T>[]>,
//     } as ReturnTypeX;
//   }
// }
