/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';
import { BaseConfigInterface } from './config.types';
import { ConvexSchemaType } from '@apps-next/convex-adapter-app';
import { Prisma } from './view-config.types';

const documentBaseSchema = z.object({
  id: z.string(),
});

export const createConfigFromConvexSchema = <T extends ConvexSchemaType>(
  schema: T
) => {
  const config: BaseConfigInterface<T, keyof T['tables']> = {
    searchableFields: {},
    viewFields: {},
    dataModel: schema,
    tableNames: Object.keys(schema.tables) as any as keyof T['tables'],
  };

  return new ConfigWithouUi(config);
};

type RemoveDollarSign<T> = T extends `$${infer _}` ? never : T;

type PrismaTableName<T> = (keyof T)[];

export const createConfigFromPrismaSchema = <T extends Prisma, PrismaClient>(
  datamodel: T
) => {
  const config: BaseConfigInterface<
    T,
    RemoveDollarSign<PrismaTableName<PrismaClient>[number]>[]
  > = {
    searchableFields: {},
    viewFields: {},
    dataModel: datamodel,
    tableNames: Object.values(datamodel.models as any).map((m: any) =>
      (m.name as string).toLowerCase()
    ) as any as RemoveDollarSign<PrismaTableName<PrismaClient>[number]>[],
  };

  return new ConfigWithouUi(config);
};

export class ConfigWithouUi<T extends Record<string, any>, Tables> {
  // config: BaseConfigInterface<T, keyof T['tables']>;
  constructor(private config: BaseConfigInterface<T, Tables>) {}

  getAllTables() {
    return this.config.tableNames;
  }
}

export class PrismaConfig<T extends Record<string, any>> {
  constructor(public prisma: T) {}
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Register {
  // config: ConfigWithouUi
  // prisma: PrismaConfig<Prisma.DMMF.Datamodel>
  //
}

export type RegisteredRouter = Register extends { config: infer T } ? T : never;
export type RegisteredPrisma = Register extends { prisma: infer T } ? T : never;

export type FieldType =
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'Date'
  | 'Reference'
  | 'Union';

export type RecordType<T = any> = T;

export type FieldConfig = {
  type: FieldType;
  name: string;
};

export type GetTableName<T extends DataModel> = keyof T['tables'];

type GetTableName2<TDataModel extends Record<string, any> = any> =
  keyof TDataModel['tables'];

export type GetFieldName<
  TDataModel extends Record<string, any> = any,
  T extends GetTableName2<TDataModel> = any
> = keyof TDataModel['tables'][T]['validator']['fields'];

export type SearchableField<
  TDataModel extends Record<string, any> = any,
  T extends GetTableName2<TDataModel> = any
> = {
  field: GetFieldName<TDataModel, T>;
  name: string;
  filterFields: GetFieldName<TDataModel, T>[];
};

export type GlobalConfig = {
  //
};

export type DataModel<TableNames extends string = any> = {
  tables: {
    [key in TableNames]: {
      schema: typeof documentBaseSchema;
    };
  };
};

export type DataProvider = 'convex' | 'prisma';
