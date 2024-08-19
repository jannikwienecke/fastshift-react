import { BaseConfig, BaseConfigInterface } from '@apps-next/core';
import { generateViewFieldsFromPrismaSchema } from './_internal/prisma-generate-view-fields';
import { getTableNamesFromPrismaSchema } from './_internal/prisma-get-tables-from-schema';
import { GetPrismaTableName } from './_internal/prisma.type.helper';
import { Prisma } from './prisma.types';

type RemoveDollarSign<T> = T extends `$${infer _}` ? never : T;

type PrismaTableName<T> = (keyof T)[];

export const createConfigFromPrismaSchema = <
  PrismaClient extends Record<string, any>
>(
  Prisma: Prisma['dmmf']['datamodel']
) => {
  type TableName = GetPrismaTableName<PrismaClient>;

  type GetDataModelPrisma = {
    [TKey in TableName]: Awaited<
      ReturnType<PrismaClient[TKey]['findFirstOrThrow']>
    >;
  };

  const tableNames = getTableNamesFromPrismaSchema(Prisma) as TableName[];
  const viewFields = generateViewFieldsFromPrismaSchema(Prisma);

  const config: BaseConfigInterface<
    Prisma['dmmf']['datamodel'],
    RemoveDollarSign<PrismaTableName<PrismaClient>[number]>[],
    GetDataModelPrisma
  > = {
    searchableFields: {},
    viewFields,
    dataModel: Prisma,
    testType: {} as GetDataModelPrisma,
    tableNames,
  };

  return new BaseConfig(config);
};
