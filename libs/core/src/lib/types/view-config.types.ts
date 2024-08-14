import { FieldConfig, GetFieldName, SearchableField } from './base.types';

export type ViewFieldConfig = Record<string, FieldConfig>;

export type ViewConfig<
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
    searchableField?: SearchableField<TDataModel, T>;
  };
} & ViewConfig<TDataModel, T>;

export interface BaseViewConfigManagerInterface<
  TViewConfig extends ViewConfig = ViewConfig
> {
  viewConfig: TViewConfig;
  getDisplayFieldLabel(): string;
  getSearchableField(): SearchableField | undefined;
  getTableName(): string;
}
