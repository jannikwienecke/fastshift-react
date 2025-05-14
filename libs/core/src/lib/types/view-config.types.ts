import {
  FieldConfig,
  FieldConfigOptions,
  GetTableDataType,
  GetTableName,
  ID,
  IndexField,
  RecordType,
  SearchableField,
} from './base.types';
import { IncludeConfig } from './config.types';
import { DisplayOptionsUiType } from './filter.types';
import { QueryServerProps } from './query.types';
export type ViewFieldConfig = Record<string, FieldConfig>;

export type ViewConfigBaseInfo<T extends GetTableName> = {
  viewName: string;
  tableName: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.FC<any>;
  iconColor?: string;
  relativePath?: string;
};

export type ViewConfigQueryOptions<T extends GetTableName> = {
  showDeleted?: boolean;
  showEmptyGroups?: boolean;
  searchableFields?: SearchableField[];
  indexFields?: IndexField[];
  primarySearchField?: keyof GetTableDataType<T>;
  viewType?: DisplayOptionsUiType['viewType'];
  selectedViewFields?: (keyof GetTableDataType<T>)[];

  sorting?: {
    field: keyof GetTableDataType<T> | '_creationTime';
    direction: 'asc' | 'desc';
  };
  grouping?: {
    field: keyof GetTableDataType<T>;
  };
};

export type ViewConfigType<T extends GetTableName = any> =
  ViewConfigBaseInfo<T> & {
    _generated?: boolean;
    viewFields: ViewFieldConfig;
    localMode?: {
      enabled: boolean;
    };
    includeFields: IncludeConfig<keyof GetTableDataType<T>>[string];
    displayField: {
      field: keyof GetTableDataType<T>;
      cell?: (value: GetTableDataType<T>) => React.ReactNode;
    };
    colorField?: {
      field: keyof GetTableDataType<T>;
    };
    fields?: {
      [field in keyof GetTableDataType<T>]?: FieldConfigOptions<T, field>;
    };
    query?: ViewConfigQueryOptions<T>;
    loader?: {
      _prismaLoaderExtension?: Record<string, unknown>;
      postLoaderHook?: (
        ctx: unknown,
        props: QueryServerProps,
        items: GetTableDataType<T>[]
      ) => Promise<GetTableDataType<T>[]>;
    };
    isManyToMany?: boolean;

    mutation?: {
      softDelete?: boolean;
      softDeleteField?: keyof GetTableDataType<T>;
      beforeInsert?: (data: GetTableDataType<T>) => GetTableDataType<T>;
      beforeUpdate?: (
        data: GetTableDataType<T>,
        newData: GetTableDataType<T>
      ) => GetTableDataType<T>;
      beforeSelect?: (
        data: GetTableDataType<T>,
        options: {
          newIds: ID[];
          deleteIds: ID[];
          recordWithInclude: unknown;
          field: string;
        }
      ) =>
        | {
            newIds: ID[];
            deleteIds: ID[];
          }
        | {
            error: string;
          };
    };
    ui?: {
      showComboboxOnClickRelation?: boolean;
    };
  };

export type RegisteredViews = Partial<{
  [key: string]: ViewConfigType;
}>;
