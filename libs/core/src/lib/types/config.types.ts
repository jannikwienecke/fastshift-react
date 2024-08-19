import { SearchableField } from './base.types';
import { ViewFieldConfig } from './view-config.types';

type RemoveDollarSign<T> = T extends `$${infer _}` ? never : T;

type PrismaTableName<T> = (keyof T)[];

export interface BaseConfigInterface<
  TDataModel extends Record<string, any>,
  TTables,
  TTest extends Record<string, any>
> {
  dataModel: TDataModel;
  tableNames: TTables;
  viewFields: Record<string, ViewFieldConfig>;
  searchableFields: Record<string, SearchableField>;
  // testType: {
  //   [TKey in RemoveDollarSign<PrismaTableName<TTest>[number]>]: Awaited<
  //     ReturnType<TTest[TKey]['findFirstOrThrow']>
  //   >;
  // };
  testType: TTest;
}
