/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';

const documentBaseSchema = z.object({
  id: z.string(),
});

export type FieldType =
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'Date'
  | 'Reference'
  | 'Union';

export type RecordType<T = Record<string, unknown>> = T;

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
