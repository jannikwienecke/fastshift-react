/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';

const documentBaseSchema = z.object({
  id: z.string(),
});

export type FieldType = 'String' | 'Number' | 'Boolean' | 'Date';

export type RecordType<T = Record<string, unknown>> = {
  id: string;
} & T;

export type DataModel<TableNames extends string = any> = {
  [key in TableNames]: {
    // document: typeof documentBaseSchema;
    schema: typeof documentBaseSchema;
    // fields: {
    //   type: FieldType;
    // };
  };
};

export type ViewFieldConfig = Record<string, FieldConfig>;

export type FieldConfig = {
  type: FieldType;
};

export type GetTableName<T extends DataModel> = keyof T;

export type ViewConfig<
  TDataModel extends DataModel = any,
  T extends keyof TDataModel = any
> = {
  tableName: T;
  labelKey: keyof z.infer<TDataModel[T]['schema']>;
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
