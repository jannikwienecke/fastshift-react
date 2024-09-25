/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';
import { BaseConfigInterface } from './config.types';

const documentBaseSchema = z.object({
  id: z.string(),
});

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Register {}

export type RegisteredRouter = Register extends { config: infer T } ? T : any;

export type FieldType =
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'Date'
  | 'Reference'
  | 'OneToOneReference'
  | 'Union'
  | 'Enum';

export type RecordType = Record<any, any>;

export type RecordRelationType = {
  id: ID;
  label: string;
};

export type Enum = { name: string };

export type TableRelationType = 'oneToOne' | 'oneToMany' | 'manyToMany' | '';

export type FieldRelationType = {
  tableName: string;
  fieldName: string;
  type: TableRelationType;
  manyToManyRelation?: string;
  // e.g. type: 'TaskTag',
  manyToManyTable?: string;
  manyToManyModelFields?: FieldConfig[];
};
export type FieldConfig = {
  isId?: boolean;
  isRelationalIdField?: boolean;
  type: FieldType;
  name: string;
  isList: boolean;
  isRequired?: boolean;
  relation?: FieldRelationType;
  enum?: {
    name: string;
    values: Enum[];
  };
};

export type GetTableName = keyof RegisteredRouter['config']['_datamodel'];

// export type GetTableNameSecond =
//   RegisteredRouter['config']['tableNames'][number];

export type GetTableDataType<T extends GetTableName> =
  RegisteredRouter['config']['_datamodel'][T];

export type GetRowType<T extends GetTableName> = GetTableDataType<T>;

export type GetFieldName<TDataModel extends Record<string, any> = any> =
  keyof TDataModel['tables'][GetTableName]['validator']['fields'];

export type SearchableField<TDataModel extends Record<string, any> = any> = {
  field: GetFieldName<TDataModel>;
  name: string;
  filterFields: GetFieldName<TDataModel>[];
};

export type IndexField<TDataModel extends Record<string, any> = any> = {
  fields: GetFieldName<TDataModel>[];
  name: string;
};

export type GlobalConfig = {
  provider: DataProvider;
  config: BaseConfigInterface;
};

export type DataModel<TableNames extends string = any> = {
  tables: {
    [key in TableNames]: {
      schema: typeof documentBaseSchema;
    };
  };
};

export type DataProvider = 'convex' | 'default';

export type ID = string | number;
