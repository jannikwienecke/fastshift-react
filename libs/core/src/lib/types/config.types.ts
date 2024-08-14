import { SearchableField } from './base.types';
import { ViewFieldConfig } from './view-config.types';

export interface BaseConfigInterface<
  TDataModel extends Record<string, any>,
  TableName
> {
  dataModel: TDataModel;
  tableNames: TableName[];
  viewFields: Record<string, ViewFieldConfig>;
  searchableFields: Record<string, SearchableField>;
}
