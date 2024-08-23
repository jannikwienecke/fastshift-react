import { BaseViewConfigManagerInterface } from '../base-view-config';
import { FieldConfig, GetTableDataType, GetTableName } from './base.types';
import { IncludeConfig } from './config.types';

export type ViewFieldConfig = Record<string, FieldConfig>;

export type ViewConfigType<T extends GetTableName = any> = {
  viewName: string;
  tableName: T;
  viewFields: ViewFieldConfig;
  includeFields: IncludeConfig[string];
  displayField: {
    field: keyof GetTableDataType<T>;
    cell?: (value: GetTableDataType<T>) => React.ReactNode;
  };
  query?: {
    //
  };
  loader?: {
    _prismaLoaderExtension?: Record<string, unknown>;
  };
};

export type RegisteredViews = Partial<{
  [key in GetTableName]: ViewConfigType;
}>;

export type ViewContextType = {
  viewConfigManager: BaseViewConfigManagerInterface;
  registeredViews: RegisteredViews;
};
