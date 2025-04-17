import {
  _log,
  BaseViewConfigManager,
  ComboxboxItem,
  CommandformItem,
  CommandformProps,
  FieldConfig,
  FormState,
  getFieldLabel,
  makeData,
  RecordType,
  Row,
  ViewConfigType,
} from '@apps-next/core';
// import { type } from 'arktype';
import { getTimeValueFromDateString } from '../ui-adapter/filter-adapter';
import { getComponent } from '../ui-components/ui-components.helper';
import { store$ } from './legend.store';

export const getViewConfigManager = () => {
  const defaultView = store$.viewConfigManager.get();
  const view = store$.commandform.view.get() as ViewConfigType | undefined;

  const viewConfigManager = view
    ? new BaseViewConfigManager(view)
    : defaultView;

  return viewConfigManager as BaseViewConfigManager;
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

export const getComplexFormFields = () => {
  const viewConfigManager = getViewConfigManager();
  const newRow = store$.commandform.row.get();

  const complexFields = viewConfigManager
    .getViewFieldList()
    .filter((f) => f.hideFromForm !== true)
    .filter((field) => field.relation || field.enum || field.type === 'Date')
    .map((field) => {
      const icon = getComponent({
        fieldName: field.name,
        componentType: 'icon',
      });

      const value = newRow
        ? (newRow?.getValue?.(field.name) as Row | Row[])
        : undefined;

      const label = Array.isArray(value)
        ? ''
        : value?.id
        ? value.label
        : getFieldLabel(field, true);

      return {
        id: field.name,
        label,
        icon: icon ? icon : undefined,
        field,
      } satisfies ComboxboxItem;
    });

  return complexFields;
};

export const formHelper = (view: ViewConfigType, row?: Row) => {
  const viewConfigManager = new BaseViewConfigManager(view);

  const getFormState = () => {
    const errors = viewConfigManager.validateRecord(row?.raw);

    if (errors) {
      _log.warn('Form State Errors: ', errors);
    }

    return {
      isReady: !errors,
      errors: errors ?? {},
    } satisfies FormState;
  };

  const _updateRowValue = (field: FieldConfig, value: unknown) => {
    if (!row) return;
    const data = makeData(
      store$.views.get(),
      view.viewName
    )([{ ...row.raw, [field.name]: value }]);
    const updatedRow = data.rows?.[0];
    return updatedRow as Row;
  };

  const getValueOfRow = (fieldName: string) => {
    return row ? row?.getValue?.(fieldName) : undefined;
  };

  const viewFields = viewConfigManager
    .getViewFieldList()
    .filter((f) => f.hideFromForm !== true);

  const primitiveFields = viewFields.filter(
    (field) => !field.relation && !field.enum && field.type !== 'Date'
  );

  const complexFields = viewFields
    .filter((f) => f.hideFromForm !== true)
    .filter((field) => field.relation || field.enum || field.type === 'Date');

  const getComplexFormFields = () => {
    return complexFields.map((field) => {
      const icon = getComponent({
        fieldName: field.name,
        componentType: 'icon',
      });

      const value = getValueOfRow(field.name);
      const label = Array.isArray(value) ? '' : value?.id ? value.label : value;

      return {
        id: field.name,
        label,
        icon: icon ? icon : undefined,
        field,
        value,
        rowValues: Array.isArray(value) ? value : undefined,
        rowValue: !Array.isArray(value) && value?.raw ? value : undefined,
      } satisfies CommandformItem;
    });
  };

  const getAllPrimitiveFormFields = () => {
    return primitiveFields.map((field) => {
      const icon = getComponent({
        fieldName: field.name,
        componentType: 'icon',
      });

      const label = getFieldLabel(field, true) ?? '';

      return {
        label,
        field,
        id: field.name,
        icon: icon ? icon : undefined,
        value: getValueOfRow(field.name),
      } satisfies CommandformItem;
    });
  };

  const getPrimitiveFormFields = () =>
    // sort by isRichEditor -> rich editor should be last
    getAllPrimitiveFormFields()
      .filter((f) => !f.field.isDisplayField)
      .sort((a, b) => {
        if (a.field.richEditor && b.field.richEditor) return 0;
        if (a.field.richEditor) return 1;
        if (b.field.richEditor) return -1;
        return 0;
      });

  const displayField = getAllPrimitiveFormFields().find(
    (f) => f.field.isDisplayField
  );

  return {
    getPrimitiveFormFields,
    getComplexFormFields,
    displayField,
    formState: getFormState(),
    _updateRowValue,
  };
};
