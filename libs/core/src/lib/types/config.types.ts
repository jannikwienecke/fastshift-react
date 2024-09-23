/* eslint-disable @typescript-eslint/no-explicit-any */

import { IndexField, SearchableField } from './base.types';
import { ViewConfigType, ViewFieldConfig } from './view-config.types';

export type IncludeConfig = Record<string, string[]>;

export type ModelField = {
  name: string;
  kind: string;
  isList: boolean;
  isRequired: boolean;
  isUnique: boolean;
  isId: boolean;
  isReadOnly: boolean;
  hasDefaultValue: boolean;
  type: string;
  default?: { name?: string; args: unknown[] } | unknown;
  isGenerated?: boolean | undefined;
  isUpdatedAt?: boolean;
  relationName?: string;
  relationFromFields?: string[];
  relationToFields?: string[];
};

export type EnumType = {
  name: string;
  values: Array<{ name: string; dbName: string | null }>;
  dbName: string | null;
};

export type ModelSchema = {
  models: Array<{
    fields: Array<ModelField>;
    name: string;
  }>;
  enums: Array<EnumType>;
  types: unknown;
};

export interface BaseConfigInterface<
  TDataModel extends Record<string, any> = any,
  TTables = any,
  DataModelType extends Record<string, any> = any
> {
  dataModel: TDataModel;
  tableNames: TTables;
  viewFields: Record<string, ViewFieldConfig>;
  searchableFields: Record<string, SearchableField[]>;
  indexFields: Record<string, IndexField[]>;
  primarySearchField?: keyof TDataModel;
  includeFields: IncludeConfig;
  _datamodel: DataModelType;
  defaultViewConfigs: Partial<Record<string, ViewConfigType<any>>>;
}
