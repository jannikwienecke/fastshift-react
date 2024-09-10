import { BaseConfig, BaseConfigInterface } from '@apps-next/core';
import { generateViewFieldsFromPrismaSchema } from './_internal/prisma-generate-view-fields';
import { getTableNamesFromPrismaSchema } from './_internal/prisma-get-tables-from-schema';
import { GetPrismaTableName } from './_internal/prisma.type.helper';
import { Prisma } from './prisma.types';
import { generateIncludeFields } from './_internal/prisma-generate-include-fields';

type RemoveDollarSign<T> = T extends `$${infer _}` ? never : T;

type PrismaTableName<T> = (keyof T)[];

type TableName<PrismaClient extends Record<string, any>> =
  GetPrismaTableName<PrismaClient>;

type GetDataModelPrisma<PrismaClient extends Record<string, any>> = {
  [TKey in TableName<PrismaClient>]: Awaited<
    ReturnType<PrismaClient[TKey]['findFirstOrThrow']>
  >;
};

export const createConfigFromPrismaSchema = <
  PrismaClient extends Record<string, any>,
  TDataModel extends Record<string, any> = any
>(
  Prisma: TDataModel,
  options?: {
    smart?: {
      guessDisplayFieldIfNotProvided?: boolean;
    };
  }
) => {
  type TableName = GetPrismaTableName<PrismaClient>;

  const tableNames = getTableNamesFromPrismaSchema(Prisma) as TableName[];
  const viewFields = generateViewFieldsFromPrismaSchema(Prisma);
  const includeFields = generateIncludeFields(Prisma);

  type ConfigType = BaseConfigInterface<
    Prisma['dmmf']['datamodel'],
    RemoveDollarSign<PrismaTableName<PrismaClient>[number]>[],
    GetDataModelPrisma<PrismaClient>
  >;

  const config: ConfigType = {
    searchableFields: {},
    viewFields,
    // TODO FIX THIS -> Move to a type helper : GetPRismaDataModel
    dataModel: Prisma as any as Prisma['dmmf']['datamodel'],
    includeFields,
    _datamodel: {} as GetDataModelPrisma<PrismaClient>,
    tableNames,
    defaultViewConfigs: {},
  };

  const _config = {
    ...config,
  } as ConfigType;

  return new BaseConfig(_config);
};

// eslint-disable-next-line
(BigInt.prototype as any).toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};
