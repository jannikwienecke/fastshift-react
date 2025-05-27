/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { object, z } from 'zod';
import { BaseConfigInterface } from './config.types';
import { CommandbarItem } from './ui.types';

const documentBaseSchema = object({
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

export type FieldConfigOptions<
  T extends GetTableName = any,
  F extends keyof GetTableDataType<T> = any
> = {
  // defaultValue?: unknown;
  defaultValue?: GetTableDataType<T>[F] | (() => GetTableDataType<T>[F]);
  hideFromForm?: boolean;
  hide?: boolean;
  isDisplayField?: true;
  richEditor?: boolean;
  isDateField?: boolean;
  dateFormatter?: (date: Date) => string;
  showCheckboxInList?: boolean;
  showInProperties?: boolean;
  validator?: () => any;
  validationErrorMessage?: (t: any) => string;
};

export type FieldConfig<TName = string> = {
  isId?: boolean;
  isRelationalIdField?: boolean;
  type: FieldType;
  name: TName;
  label?: string;
  editLabel?: string;
  editSearchString: string;
  description?: string;
  isList: boolean;
  isRequired?: boolean;
  relation?: FieldRelationType;
  isSystemField?: boolean;
  isRecursive?: boolean;
  //
  enum?: {
    name: string;
    values: Enum[];
  };
} & FieldConfigOptions;

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

export type UserStoreCommand = {
  command: string;
} & Omit<CommandbarItem, 'command'>;
