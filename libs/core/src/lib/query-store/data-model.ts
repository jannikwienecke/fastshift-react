import { BaseViewConfigManager } from '../base-view-config';
import { FieldConfig, RecordType, RegisteredViews } from '../types';

export type Row<T extends RecordType | undefined = RecordType> = {
  raw: T;
  label: string;
  id: string;
  getValue<K extends keyof T>(
    key: K
  ): T[K] extends Array<any>
    ? Row<T[K][0]>[]
    : T[K] extends RecordType | undefined
    ? Row<T[K]>
    : T[K];
  getValueLabel(key: keyof T): string;
  getField(key: keyof T): {
    id: string;
    label: string;
    field: FieldConfig;
  };
};

export type DataModelNew<T extends RecordType = RecordType> = {
  rows: Row<T>[];
};

export const makeData = (
  registeredViews: RegisteredViews,
  viewName: string
) => {
  return <T extends RecordType = RecordType>(data: T[]): DataModelNew<T> => {
    const viewConfig = registeredViews[viewName as string];
    if (!viewConfig) {
      console.trace();
      throw new Error(`View ${viewName} not found`);
    }

    const viewConfigManager = new BaseViewConfigManager(viewConfig);

    const label = viewConfigManager.getDisplayFieldLabel();

    return {
      rows: data.map((item) => {
        return {
          raw: item,
          id: item ? (item['id'] as string) : '',
          label: item ? item[label] : '',
          getValue: <K extends keyof T>(key: K) => {
            const field = viewConfigManager.getFieldBy(key.toString());
            const viewConfig = registeredViews[field.relation?.tableName ?? ''];

            if (viewConfig) {
              const value = item[key];
              const isArray = Array.isArray(value);

              const data = makeData(
                registeredViews,
                field.relation?.tableName ?? ''
              )(isArray ? value : [value]);

              const r = isArray ? data.rows : data.rows?.[0];

              return r as T[K];
            } else {
              return item[key];
            }
          },
          getValueLabel: (key: keyof T) => item[key].toString(),
          getField: (key: keyof T) => {
            const field = viewConfigManager.getFieldBy(key.toString());
            const value = item[key];

            return {
              id: value?.id ?? value ?? '',
              label: value?.toString(),
              field,
            };
          },
        };
      }),
    };
  };
};
