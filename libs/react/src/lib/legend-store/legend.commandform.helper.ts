import {
  BaseViewConfigManager,
  CommandformProps,
  FieldConfig,
  // RecordErrors,
  invarant,
  makeData,
  RecordType,
  Row,
  ViewConfigType,
  _log,
  getFieldLabel,
} from '@apps-next/core';
// import { type } from 'arktype';
import { getTimeValueFromDateString } from '../ui-adapter/filter-adapter';
import { store$ } from './legend.store';

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
  const viewConfigManager = getViewConfigManager();
  const row = store$.commandform.row.get();

  const errors = viewConfigManager.validateRecord(row?.raw);

  if (errors) {
    _log.warn('Form State Errors: ', errors);
  }

  return {
    isReady: !errors,
    errors: errors ?? {},
  } satisfies CommandformProps['formState'];
};

export const getRecordTypeFromRow = () => {
  const allFields = getViewFields();
  const row = store$.commandform.row.get();

  if (!row) return {};

  const obj = allFields.reduce((prev, field) => {
    // Instead of trying to pick individual fields, we'll validate the whole object at the end
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

  const softDeleteField = getViewConfigManager().getSoftDeleteField();

  if (softDeleteField) {
    obj[softDeleteField] = false;
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

export const getErrorListFromFormState = (): string[] => {
  const viewFields = getViewFields();
  const formState = getFormState();

  return Object.entries(formState.errors).map(([key, value]) => {
    const field = viewFields.find((f) => f.name === key);
    if (!field) return '';

    return `${getFieldLabel(field, true)}: ${value.error}`;
  });
};
