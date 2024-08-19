import { FieldConfig, GetTableDataType, GetTableName } from './base.types';

export type ViewFieldConfig = Record<string, FieldConfig>;

export type ViewConfigType<T extends GetTableName = any> = {
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
