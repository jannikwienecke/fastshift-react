import {
  FieldConfig,
  GetTableDataType,
  GetTableName,
  IndexField,
  SearchableField,
} from './base.types';
import { IncludeConfig } from './config.types';

export type ViewFieldConfig = Record<string, FieldConfig>;

export type ViewConfigBaseInfo<T extends GetTableName> = {
  viewName: string;
  tableName: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.FC<any>;
  iconColor?: string;
  relativePath?: string;
};

export type ViewConfigType<T extends GetTableName = any> =
  ViewConfigBaseInfo<T> & {
    _generated?: boolean;
    viewFields: ViewFieldConfig;
    includeFields: IncludeConfig[string];
    displayField: {
      field: keyof GetTableDataType<T>;
      cell?: (value: GetTableDataType<T>) => React.ReactNode;
    };
    query?: {
      searchableFields?: SearchableField[];
      indexFields?: IndexField[];
      primarySearchField?: keyof GetTableDataType<T>;
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
