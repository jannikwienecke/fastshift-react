import {
  BaseViewConfigManager,
  CommandformProps,
  FieldConfig,
  FormErrors,
  invarant,
  makeData,
  RecordType,
  Row,
  ViewConfigType,
} from '@apps-next/core';
import { store$ } from './legend.store';
import { getTimeValueFromDateString } from '../ui-adapter/filter-adapter';

export const getViewConfigManager = () => {
  const view = store$.commandform.view.get() as ViewConfigType;
  invarant(!!view, 'No View');

  const viewConfigManager = new BaseViewConfigManager(view, {});

  return viewConfigManager;
};
export const getViewFields = () => {
  return getViewConfigManager().getViewFieldList();
};

export const getValueForField = (field: FieldConfig) => {
  const row = store$.commandform.row.get();
  if (!row) return undefined;

  const value = row.getValue?.(field.name) as Row | Row[] | string | number;

  if (Array.isArray(value)) {
    return value.map((v) => v.id);
  } else if (typeof value === 'object') {
    return value.id;
  } else {
    return value;
  }
};

export const getFormState = () => {
  const fields = getViewFields();

  const errors = fields.reduce((prev, field) => {
    const value = getValueForField(field);
    if (!field.isRequired && value === undefined) return prev;

    if (field.isRequired && value === undefined) {
      return {
        ...prev,
        [field.name]: { error: `Field ${field.label} is required` },
      };
    }

    return { ...prev };
  }, {} as FormErrors);

  return {
    isReady: Object.values(errors).length === 0,
    errors,
  } satisfies CommandformProps['formState'];
};

export const getRecordTypeFromRow = () => {
  const allFields = getViewFields();
  const row = store$.commandform.row.get();

  if (!row) return {};

  const obj = allFields.reduce((prev, field) => {
    const value = row.getValue?.(field.name);

    const valueToUse =
      field.type === 'Boolean'
        ? Boolean(value)
        : field.type === 'Date' && value
        ? getTimeValueFromDateString(value, true)
        : field.relation?.manyToManyTable
        ? (value as Row[] | undefined)?.map?.((x) => x.id)
        : field.relation
        ? (value as Row | undefined)?.id || undefined
        : value;

    const fieldNameRelation = field.relation?.fieldName ?? null;
    const nameToUse = fieldNameRelation ?? field.name;

    return {
      ...prev,
      [nameToUse]: valueToUse,
    };
  }, {} as RecordType);

  const softDeleteField = store$.viewConfigManager.getSoftDeleteIndexField();
  if (softDeleteField) {
    const softDeleteFieldName = softDeleteField.name;
    obj[softDeleteFieldName] = false;
  }

  return obj;
};

export const createRow = (recordType: RecordType) => {
  const view = store$.commandform.view.get();
  if (!view) return null;

  return makeData(store$.views.get(), view.viewName)([recordType]).rows?.[0];
};

export const getDefaultRow = () => {
  const viewFields = getViewFields();

  const obj = viewFields.reduce((prev, field) => {
    return {
      ...prev,
      [field.name]:
        typeof field.defaultValue === 'function'
          ? field.defaultValue()
          : field.defaultValue,
    };
  }, {} as RecordType);

  return createRow(obj);
};
