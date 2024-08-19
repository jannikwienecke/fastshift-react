import { BaseConfigInterface, BaseConfig } from '@apps-next/core';

type RemoveDollarSign<T> = T extends `$${infer _}` ? never : T;

type PrismaTableName<T> = (keyof T)[];

type PrismaModels = {
  models: Array<unknown>;
};

export const createConfigFromPrismaSchema = <
  T extends PrismaModels,
  PrismaClient extends Record<string, any>
>(
  datamodel: T
) => {
  type TableName = RemoveDollarSign<PrismaTableName<PrismaClient>[number]>;

  const tableNames = Object.values(datamodel.models as any).map((m: any) =>
    (m.name as string).toLowerCase()
  ) as any as TableName[];

  const config: BaseConfigInterface<
    T,
    RemoveDollarSign<PrismaTableName<PrismaClient>[number]>[],
    {
      [TKey in TableName]: Awaited<
        ReturnType<PrismaClient[TKey]['findFirstOrThrow']>
      >;
    }
  > = {
    searchableFields: {},
    viewFields: {},
    dataModel: datamodel,
    testType: {} as {
      [TKey in TableName]: Awaited<
        ReturnType<PrismaClient[TKey]['findFirstOrThrow']>
      >;
    },

    tableNames: tableNames,
  };

  return new BaseConfig(config);
};
