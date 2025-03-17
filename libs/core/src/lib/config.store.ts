import { FieldConfig, GetTableName, RecordType } from './types';

export type ComponentType =
  | 'default'
  | 'list'
  | 'comboboxListValue'
  | 'contextmenuFieldItem'
  | 'contextmenuFieldOption'
  // | 'filterValue'
  | 'icon';

export type ViewFieldsConfig<
  T extends GetTableName = any,
  U extends RecordType = any
> = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  [key in T]: {
    fields: Partial<{
      [key in keyof U]: {
        component?: Partial<{
          // [key in ComponentType]: (props: { data: Row<U> }) => React.ReactNode;
          icon: React.FC<any>;

          list: (props: { data: U }) => React.ReactNode;

          comboboxListValue: (props: {
            data: NonNullable<U[key]> extends Array<unknown>
              ? NonNullable<U[key]>[0]
              : U[key] extends RecordType
              ? U[key]
              : U[key] extends boolean
              ? boolean
              : string;
            row: U;
          }) => React.ReactNode;

          contextmenuFieldItem: (props: {
            field: FieldConfig;
          }) => React.ReactNode;

          contextmenuFieldOption: (props: {
            // data: U[key] extends Array<unknown> ? U[key][0] : U[key];
            data: NonNullable<U[key]> extends Array<any>
              ? NonNullable<U[key]>[0]
              : U[key] extends RecordType
              ? U[key]
              : U[key] extends boolean
              ? boolean
              : string;
          }) => React.ReactNode;

          default: (props: {
            data: NonNullable<U[key]> extends Array<any>
              ? NonNullable<U[key]>[0]
              : U[key] extends RecordType
              ? U[key]
              : U[key] extends boolean
              ? boolean
              : string;
          }) => React.ReactNode;
        }>;
      };
    }>;
  };
};
