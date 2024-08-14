import { FieldConfig, GetFieldName, SearchableField } from './base.types';

export type ViewFieldConfig = Record<string, FieldConfig>;

export type ViewConfigType<
  TDataModel extends Record<string, any> = any,
  T extends keyof TDataModel['tables'] = any
> = {
  tableName: T;
  viewFields: ViewFieldConfig;
  viewName: string;
  displayField: {
    field: GetFieldName<TDataModel, T>;
    cell?: (value: any) => React.ReactNode;
  };
  query?: {
    //
  };
};

export type ConvexViewConfig<
  TDataModel extends Record<string, any> = any,
  T extends keyof TDataModel['tables'] = any
> = {
  query?: {
    searchableFields?: SearchableField<TDataModel, T>;
  };
} & ViewConfigType<TDataModel, T>;

export interface BaseViewConfigManagerInterface<
  TViewConfig extends ViewConfigType = ViewConfigType
> {
  viewConfig: TViewConfig;
  getDisplayFieldLabel(): string;
  getSearchableField(): SearchableField | undefined;
  getTableName(): string;
  getViewFieldList(): FieldConfig[];
}
