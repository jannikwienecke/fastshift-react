import { BaseViewConfigManagerInterface } from '../base-view-config';
import { FieldConfig, GetTableDataType, GetTableName } from './base.types';
import { IncludeConfig } from './config.types';
import * as icons from 'react-icons/fa';

export type ViewFieldConfig = Record<string, FieldConfig>;

export type ViewConfigBaseInfo<T extends GetTableName> = {
  viewName: string;
  tableName: T;
  icon: keyof typeof icons;
  iconColor?: string;
  relativePath?: string;
};

export type ViewConfigType<T extends GetTableName = any> =
  ViewConfigBaseInfo<T> & {
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
    ui?: {
      list?: {
        showIcon?: boolean;
        useLabel?: boolean;
        fieldsLeft: (keyof GetTableDataType<T>)[];
        fieldsRight: (keyof GetTableDataType<T>)[];
      };
    };
  };

export type RegisteredViews = Partial<{
  [key: string]: ViewConfigType;
}>;

export type ViewContextType = {
  viewConfigManager: BaseViewConfigManagerInterface;
  registeredViews: RegisteredViews;
};
