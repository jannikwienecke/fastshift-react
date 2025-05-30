import { Row } from './data-model';
import { FieldConfig, GetTableName, RecordType } from './types';

export type ComponentType =
  | 'default'
  | 'list'
  | 'comboboxListValue'
  | 'contextmenuFieldItem'
  | 'contextmenuFieldOption'
  | 'filterValue'
  | 'commandbarFieldItem'
  | 'detailValue'
  // | 'filterValue'
  | 'icon';

export type UiViewConfig<
  T extends GetTableName = any,
  U extends RecordType = any
> = {
  [key in T]: {
    onDelete?: {
      showConfirmation: boolean;
    };

    renderCommandbarRow?: (props: { row: Row<U> }) => React.ReactNode;

    fields: Partial<{
      [key in keyof U]: {
        fieldLabel?: () => string | React.ReactNode;
        component?: Partial<{
          // [key in ComponentType]: (props: { data: Row<U> }) => React.ReactNode;
          icon: React.FC<any>;

          list: (props: { data: U }) => React.ReactNode;

          detailValue: (props: { data: U }) => React.ReactNode;

          comboboxListValue: (props: {
            data: NonNullable<U[key]> extends Array<unknown>
              ? NonNullable<U[key]>[0]
              : U[key] extends RecordType | undefined
              ? U[key]
              : U[key] extends boolean
              ? boolean
              : string;
            row: U;
          }) => React.ReactNode;

          filterValue: (props: {
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
              : U[key] extends RecordType | undefined
              ? U[key]
              : U[key] extends boolean
              ? boolean
              : string;
          }) => React.ReactNode;

          commandbarFieldItem: (props: {
            field: FieldConfig;
            value: Row<U>;
          }) => React.ReactNode;

          default: (props: {
            data: NonNullable<U[key]> extends Array<any>
              ? NonNullable<U[key]>[0]
              : U[key] extends RecordType | undefined
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

export type ViewConfig<U extends RecordType = any> = {
  onDelete: {
    showConfirmation: boolean;
  };
  fields?: Partial<{
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    [key in keyof U]: {
      //
    };
  }>;
};
