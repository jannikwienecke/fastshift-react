/* eslint-disable @typescript-eslint/no-explicit-any */

import { SearchableField } from './base.types';
import { ViewConfigType, ViewFieldConfig } from './view-config.types';

export type IncludeConfig = Record<string, string[]>;

export interface BaseConfigInterface<
  TDataModel extends Record<string, any> = any,
  TTables = any,
  DataModelType extends Record<string, any> = any
> {
  dataModel: TDataModel;
  tableNames: TTables;
  viewFields: Record<string, ViewFieldConfig>;
  searchableFields: Record<string, SearchableField>;
  includeFields: IncludeConfig;
  _datamodel: DataModelType;
  defaultViewConfigs: Partial<Record<string, ViewConfigType<any>>>;
}
