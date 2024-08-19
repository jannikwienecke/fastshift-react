import {
  FieldConfig,
  GetTableDataType,
  GetTableName,
  RegisteredRouter,
  SearchableField,
} from './base.types';

export type ViewFieldConfig = Record<string, FieldConfig>;

export type Prisma = {
  models: Array<unknown>;
};

// export type GetTableName = RegisteredRouter['config']['tableNames'][number];
// export type GetTableDataType<T extends GetTableName> =
//   // ReturnType<RegisteredPrisma['prisma'][T]['findFirstOrThrow']>
//   RegisteredRouter['config']['testType'][T];
// // keyof GetPersonFromType<Awaited<ReturnType<PrismaClient[TableName]['findFirst']>>>

type RemoveNull<T> = T extends null ? never : T;

type GetFieldNamePrisma<
  TDataModel extends Record<string, any>,
  TableName extends keyof TDataModel
> = keyof RemoveNull<Awaited<ReturnType<TDataModel[TableName]['findFirst']>>>;

type GetResultOfTable<
  TDataModel extends Record<string, any>,
  TableName extends keyof TDataModel
> = RemoveNull<Awaited<ReturnType<TDataModel[TableName]['findFirst']>>>;

export type ViewConfigType<
  TDataModel extends Record<string, any> = any,
  T extends GetTableName = never
> = {
  dbProvider: 'convex' | 'prisma';
  viewFields: ViewFieldConfig;
  viewName: string;
  displayField: {
    field: keyof GetTableDataType<T>;
    cell?: (value: GetResultOfTable<TDataModel, T>) => React.ReactNode;
  };
  query?: {
    //
  };
};

export type ViewConfig<
  TDataModel extends Record<string, any> = any,
  T extends keyof TDataModel = any
> = {
  tableName: T;
  dbProvider: 'convex' | 'prisma';
  viewFields: ViewFieldConfig;
  displayField: {
    field: GetFieldNamePrisma<TDataModel, T>;
    cell?: (value: GetResultOfTable<TDataModel, T>) => React.ReactNode;
  };
  query?: {
    searchableFields?: SearchableField<TDataModel, T>;
  };
} & ViewConfigType<TDataModel>;

// export type ConvexViewConfig<
//   TDataModel extends Record<string, any> = any,
//   T extends keyof TDataModel['tables'] = any
// > = {
//   tableName: T;
//   dbProvider: 'convex';
//   viewFields: ViewFieldConfig;
//   displayField: {
//     field: keyof GetTableDataType<T>;
//     cell?: (value: any) => React.ReactNode;
//   };
//   query?: {
//     searchableFields?: SearchableField<TDataModel, T>;
//   };
// } & ViewConfigType<TDataModel>;

// export type PrismaViewConfig<
//   TDataModel extends Record<string, any> = any,
//   T extends string = any
// > = {
//   // data: TDataModel;
//   tableName: T;
//   dbProvider: 'prisma';
//   viewFields: ViewFieldConfig;
//   viewName: string;
//   displayField: {
//     field: keyof GetTableDataType<T>;
//     cell?: (value: GetResultOfTable<TDataModel, T>) => React.ReactNode;
//   };
//   query?: {
//     //
//   };
// } & ViewConfigType<TDataModel>;

export interface BaseViewConfigManagerInterface<
  TViewConfig extends ViewConfigType = ViewConfigType
> {
  viewConfig: TViewConfig;
  getDisplayFieldLabel(): string;
  getSearchableField(): SearchableField | undefined;
  getTableName(): string;
  getViewName(): string;
  getViewFieldList(): FieldConfig[];
  getDbProvider(): 'convex' | 'prisma';
}
