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

export type TableRelationType = 'oneToOne' | 'oneToMany' | 'manyToMany';
export type FieldConfig = {
  isId?: boolean;
  isRelationalIdField?: boolean;
  type: FieldType;
  name: string;
  isRequired?: boolean;
  relation?: {
    tableName: string;
    fieldName: string;
    type: TableRelationType;
  };
  enum?: {
    name: string;
    values: Enum[];
  };
};

export type GetTableName = RegisteredRouter['config']['tableNames'][number];

export type GetTableDataType<T extends GetTableName> =
  RegisteredRouter['config']['testType'][T];

export type GetFieldName<TDataModel extends Record<string, any> = any> =
  keyof TDataModel['tables'][GetTableName]['validator']['fields'];

export type SearchableField<TDataModel extends Record<string, any> = any> = {
  field: GetFieldName<TDataModel>;
  name: string;
  filterFields: GetFieldName<TDataModel>[];
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

export type DataProvider = 'convex' | 'prisma';

export type ID = string | number;
