import {
  FieldConfig,
  GetTableDataType,
  GetTableName,
  SearchableField,
} from './base.types';

export type ViewFieldConfig = Record<string, FieldConfig>;

export type ViewConfigType<T extends GetTableName = any> = {
  viewFields: ViewFieldConfig;
  viewName: string;
  tableName: T;
  displayField: {
    field: keyof GetTableDataType<T>;
    cell?: (value: GetTableDataType<T>) => React.ReactNode;
  };
  query?: {
    //
  };
};

export interface BaseViewConfigManagerInterface<
  TViewConfig extends ViewConfigType = ViewConfigType
> {
  viewConfig: TViewConfig;
  getDisplayFieldLabel(): string;
  getSearchableField(): SearchableField | undefined;
  getTableName(): string;
  getViewName(): string;
  getViewFieldList(): FieldConfig[];
}
