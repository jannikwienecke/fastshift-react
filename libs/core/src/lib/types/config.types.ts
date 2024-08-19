import { SearchableField } from './base.types';
import { ViewFieldConfig } from './view-config.types';

export interface BaseConfigInterface<
  TDataModel extends Record<string, any>,
  TTables,
  TTest extends Record<string, any>
> {
  dataModel: TDataModel;
  tableNames: TTables;
  viewFields: Record<string, ViewFieldConfig>;
  searchableFields: Record<string, SearchableField>;
  testType: TTest;
}
