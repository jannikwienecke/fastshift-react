import { BaseConfig, BaseConfigInterface } from '@apps-next/core';
import { generateDefaultViewConfigs } from './_internal/prisma-generate-default-view-configs';
import { generateViewFieldsFromPrismaSchema } from './_internal/prisma-generate-view-fields';
import { getTableNamesFromPrismaSchema } from './_internal/prisma-get-tables-from-schema';
import { GetPrismaTableName } from './_internal/prisma.type.helper';
import { Prisma } from './prisma.types';
import { generateIncludeFields } from './_internal/prisma-generate-include-fields';

type RemoveDollarSign<T> = T extends `$${infer _}` ? never : T;

type PrismaTableName<T> = (keyof T)[];

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

  type GetDataModelPrisma = {
    [TKey in TableName]: Awaited<
      ReturnType<PrismaClient[TKey]['findFirstOrThrow']>
    >;
  };

  const tableNames = getTableNamesFromPrismaSchema(Prisma) as TableName[];
  const viewFields = generateViewFieldsFromPrismaSchema(Prisma);
  const includeFields = generateIncludeFields(Prisma);

  const config: BaseConfigInterface<
    Prisma['dmmf']['datamodel'],
    RemoveDollarSign<PrismaTableName<PrismaClient>[number]>[],
    GetDataModelPrisma
  > = {
    searchableFields: {},
    viewFields,
    // TODO FIX THIS -> Move to a type helper : GetPRismaDataModel
    dataModel: Prisma as any as Prisma['dmmf']['datamodel'],
    includeFields,
    testType: {} as GetDataModelPrisma,
    tableNames,
  };

  generateDefaultViewConfigs({
    tableNames: tableNames as string[],
    dataModel: Prisma as any as Prisma['dmmf']['datamodel'],
    config,
    guessDisplayFieldIfNotProvided:
      options?.smart?.guessDisplayFieldIfNotProvided,
  });

  return new BaseConfig(config);
};

// eslint-disable-next-line
(BigInt.prototype as any).toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};
