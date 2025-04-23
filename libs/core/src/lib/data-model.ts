import { BaseViewConfigManager } from './base-view-config';
import { getViewByName } from './core-utils';
import { NONE_OPTION } from './core.constants';
import { RecordType, FieldConfig, RegisteredViews, ID } from './types';

export type Row<T extends RecordType | string | number | undefined = any> = {
  raw: T;
  label: string;
  id: string;
  updated?: number;
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

export type RelationalDataModel<T extends RecordType = RecordType> = {
  [key: string]: DataModelNew<T>;
};

export const makeData = (registeredViews: RegisteredViews, name: string) => {
  if (Object.keys(registeredViews).length === 0) {
    throw new Error('Registered views not found');
  }

  return <T extends RecordType = RecordType>(data: T[]): DataModelNew<T> => {
    const viewConfig = getViewByName(registeredViews, name);
    if (!viewConfig) {
      throw new Error(`View ${name} not found`);
    }

    const viewConfigManager = new BaseViewConfigManager(viewConfig, {});

    const label = viewConfigManager.getDisplayFieldLabel();
    return {
      rows: data.map((item) => {
        return {
          raw: { ...item },
          id: item ? (item['id'] as string) : '',
          label: item ? item[label] : '',
          getValue: <K extends keyof T>(key: K) => {
            const field = viewConfigManager.getFieldBy(key.toString());

            const nameOfTable = getRelationTableName(field);

            const viewConfig = field.relation
              ? getViewByName(registeredViews, nameOfTable)
              : undefined;

            if (viewConfig) {
              const value = item[key];
              const isArray = Array.isArray(value);

              const _data = makeData(registeredViews, nameOfTable);

              const data = _data(isArray ? item[key] : [item[key]]);

              const r = isArray ? data.rows : data.rows?.[0];

              return r as T[K];
            } else {
              return item[key];
            }
          },
          getValueLabel: (key: keyof T) => {
            return item[key] ? item[key].toString() : '';
          },
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

export const makeRow = (
  id: ID,
  label: string,
  raw: any,
  field: FieldConfig
): Row => {
  return {
    id: id.toString(),
    label,
    raw,
    getValue: (key: keyof any) => raw[key],
    getValueLabel: (key: keyof any) => raw[key],
    getField: (key: keyof any) => ({
      id: raw[key]?.id,
      label: raw[key]?.label,
      field,
    }),
  };
};

export const makeRowFromValue = (
  value: string | number | boolean,
  field: FieldConfig
): Row => {
  const _value = typeof value === 'boolean' ? String(value) : value;
  return makeRow(_value, _value.toString(), value, field);
};

export const getRelationTableName = (field?: FieldConfig | null) => {
  if (!field?.relation) return '';

  return (
    (field.relation?.manyToManyRelation || field.relation?.tableName) ?? ''
  );
};

export const makeNoneOption = (field: FieldConfig) => {
  return makeRow(NONE_OPTION, `No ${field.name}`, NONE_OPTION, field);
};

export const makeRowFromField = (field: FieldConfig): Row => {
  return makeRow(field.name, field.label ?? field.name, field, field);
};

export const getValue = (row: Row, fieldName: string) => {
  const raw = row.raw;
  const value = raw?.[fieldName];

  if (value === null || value === undefined) return null;

  if (Array.isArray(value)) {
    return value as Row[];
  }

  if (typeof value === 'object') {
    return value as Row;
  }

  return value as string | number | boolean;
};

export type DetailRow = Row;
