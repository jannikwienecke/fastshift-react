import { GetTableName, SearchableField, ViewConfigType } from '@apps-next/core';
// import { GetTableName } from './_internal/convex.type.helper';

// export type GetTableName = RegisteredRouter['config']['tableNames'][number];

// export type GetTableDataType<T extends GetTableName> =
//   // ReturnType<RegisteredPrisma['prisma'][T]['findFirstOrThrow']>
//   RegisteredRouter['config']['testType'][T];

export type ConvexViewConfig<
  TDataModel extends Record<string, any> = any,
  T extends GetTableName = never
> = {
  //   tableName: T;
  //   dbProvider: 'convex';
  //   viewFields: ViewFieldConfig;
  //   displayField: {
  //     field: keyof GetTableDataType<T>;
  //     cell?: (value: any) => React.ReactNode;
  //   };
  query?: {
    searchableFields?: SearchableField<TDataModel, T>;
  };
} & ViewConfigType<TDataModel>;

// export function createConvexViewConfig<T extends GetTableName>(
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
