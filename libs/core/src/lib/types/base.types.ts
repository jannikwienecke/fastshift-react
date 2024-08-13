/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';

const documentBaseSchema = z.object({
  id: z.string(),
});

// const documentBaseSchema2 = z.object({
//   id: z.object({
//     type: z.string(),
//     // optional or required
//     optional: z.literal('required'),
//   }),
// });

export type FieldType = 'String' | 'Number' | 'Boolean' | 'Date';

export type RecordType<T = Record<string, unknown>> = T;

export type ViewFieldConfig = Record<string, FieldConfig>;

export type FieldConfig = {
  type: FieldType;
};

export type GetTableName<T extends DataModel> = keyof T['tables'];

export type ViewConfig<
  TDataModel extends Record<string, any> = any,
  T extends keyof TDataModel['tables'] = any
> = {
  tableName: T;
  labelKey: keyof TDataModel['tables'][T]['validator']['fields'];
  viewFields: ViewFieldConfig;
  viewName: string;
};

export type ViewConfig2<
  TDataModel extends Record<string, any> = any,
  T extends keyof TDataModel['tables'] = any
> = {
  tableName: T;
  labelKey: keyof z.infer<TDataModel['tables'][T]['schema']>;
  viewFields: ViewFieldConfig;
  viewName: string;
};

export type GlobalConfig = {
  // adapters?: {
  //   convex?: {
  //     api?: any;
  //   };
  // };
};

type FieldSchemaType = Record<string, z.ZodTypeAny>;

type TableSchemaType = {
  schema: z.ZodTypeAny;
};

export type SchemaType = Record<string, TableSchemaType>;

export type DataModel<TableNames extends string = any> = {
  tables: {
    [key in TableNames]: {
      schema: typeof documentBaseSchema;
    };
  };
};
