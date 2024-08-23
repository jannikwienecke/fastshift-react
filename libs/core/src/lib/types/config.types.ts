import { SearchableField } from './base.types';
import { ViewFieldConfig } from './view-config.types';

export type IncludeConfig = Record<string, string[]>;

export interface BaseConfigInterface<
  TDataModel extends Record<string, any> = any,
  TTables = any,
  TTest extends Record<string, any> = any
> {
  dataModel: TDataModel;
  tableNames: TTables;
  viewFields: Record<string, ViewFieldConfig>;
  searchableFields: Record<string, SearchableField>;
  includeFields: IncludeConfig;
  testType: TTest;
}
