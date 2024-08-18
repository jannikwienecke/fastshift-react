import { FieldConfig, GetFieldName, SearchableField } from './base.types';

export type ViewFieldConfig = Record<string, FieldConfig>;

export type ViewConfigType<
  TDataModel extends Record<string, any> = any,
  T extends keyof TDataModel['tables'] = any
> = {
  tableName: T;
  dbProvider: 'convex' | 'prisma';
  viewFields: ViewFieldConfig;
  viewName: string;
  displayField: {
    field: GetFieldName<TDataModel, T>;
    cell?: (value: any) => React.ReactNode;
  };
  query?: {
    //
  };
};

export type Prisma = {
  models: Array<unknown>;
};

// keyof GetPersonFromType<Awaited<ReturnType<PrismaClient[TableName]['findFirst']>>>

type RemoveNull<T> = T extends null ? never : T;

type GetFieldNamePrisma<
  TDataModel extends Record<string, any>,
  TableName extends keyof TDataModel
> = keyof RemoveNull<Awaited<ReturnType<TDataModel[TableName]['findFirst']>>>;

type GetResultOfTable<
  TDataModel extends Record<string, any>,
  TableName extends keyof TDataModel
> = RemoveNull<Awaited<ReturnType<TDataModel[TableName]['findFirst']>>>;

export type ViewConfigTypePrisma<
  TDataModel extends Record<string, any>,
  T extends keyof TDataModel
> = {
  tableName: T;
  dbProvider: 'prisma';
  viewFields: ViewFieldConfig;
  viewName: string;
  displayField: {
    field: GetFieldNamePrisma<TDataModel, T>;
    cell?: (value: GetResultOfTable<TDataModel, T>) => React.ReactNode;
  };
  query?: {
    //
  };
};

export type ConvexViewConfig<
  TDataModel extends Record<string, any> = any,
  T extends keyof TDataModel['tables'] = any
> = {
  dbProvider: 'convex';
  query?: {
    searchableFields?: SearchableField<TDataModel, T>;
  };
} & ViewConfigType<TDataModel, T>;

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
