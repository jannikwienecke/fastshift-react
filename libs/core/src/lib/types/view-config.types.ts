import {
  FieldConfig,
  FieldConfigOptions,
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
    includeFields: IncludeConfig<keyof GetTableDataType<T>>[string];
    displayField: {
      field: keyof GetTableDataType<T>;
      cell?: (value: GetTableDataType<T>) => React.ReactNode;
    };
    colorField?: {
      field: keyof GetTableDataType<T>;
    };
    fields?: {
      // [field in keyof GetTableDataType<T>]?: {
      //   isDateField?: boolean;
      //   showCheckboxInList?: boolean;
      //   defaultValue?: GetTableDataType<T>[field];
      //   hideFromForm?: boolean;
      //   richEditor?: boolean; // for now just textarea
      // };
      [field in keyof GetTableDataType<T>]?: FieldConfigOptions<T, field>;
    };
    query?: {
      showDeleted?: boolean;
      searchableFields?: SearchableField[];
      indexFields?: IndexField[];
      primarySearchField?: keyof GetTableDataType<T>;
      sorting?: {
        field: keyof GetTableDataType<T>;
        direction: 'asc' | 'desc';
      };
      grouping?: {
        field: keyof GetTableDataType<T>;
      };
    };
    loader?: {
      _prismaLoaderExtension?: Record<string, unknown>;
    };
    mutation?: {
      softDelete?: boolean;
      softDeleteField?: keyof GetTableDataType<T>;
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
