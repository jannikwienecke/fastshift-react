import {
  _log,
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  CommandformItem,
  FieldConfig,
  FormState,
  getFieldLabel,
  getViewByName,
  makeData,
  makeRowFromValue,
  RecordType,
  Row,
} from '@apps-next/core';
import { viewRegistry } from './legend.app.registry';
import { detailFormHelper } from './legend.detailpage.helper';
import { store$ } from './legend.store';
import { copyRow } from './legend.utils';
import { perstistedStore$ } from './legend.store.persisted';

const getDetailTabsFields = () => {
  const row = store$.detail.row.raw.get();

  const fields = detailFormHelper()
    .getComplexFormFields()
    .filter(
      (f) =>
        (f.field.relation?.type === 'oneToOne' ||
          f.field.relation?.type === 'oneToMany') &&
        f.field.isList !== true
    )
    .filter((f) => {
      const value = row?.[f.field.name];

      if (!value?.id) return false;
      return true;
    });

  return fields;
};

export const detailTabsHelper = () => {
  const detailTabsFields = getDetailTabsFields();

  const activeTabFieldName = perstistedStore$.activeTabFieldName.get();

  if (!store$.detail.activeTabField.get()) {
    let defaultField = detailTabsFields?.[0];

    if (activeTabFieldName) {
      const field = detailTabsFields.find(
        (f) => f.field.name === activeTabFieldName
      );
      if (field) {
        defaultField = field;
        store$.detail.activeTabField.set(defaultField);
      } else {
        perstistedStore$.activeTabFieldName.set(undefined);
        perstistedStore$.isActivityTab.set(true);
      }
    } else {
      store$.detail.activeTabField.set(defaultField);
    }
  }

  const activeTabField = store$.detail.activeTabField.get();

  if (!activeTabField) {
    return {
      updateRow: () => null,
      saveIfDirty: () => null,
      activeTabField: null,
      detailTabsFields: [] as CommandformItem[],
      activeTabPrimitiveFields: [] as CommandformItem[],
      activeTabComplexFields: [] as CommandformItem[],
      row: null,
    } satisfies {
      row: Row | null;
      updateRow: (field: FieldConfig, value: unknown) => void;
      saveIfDirty: (field: FieldConfig) => void;
      activeTabField: CommandformItem | null;
      detailTabsFields: CommandformItem[];
      activeTabPrimitiveFields: CommandformItem[];
      activeTabComplexFields: CommandformItem[];
    };
  }

  const activeTabViewConfig = getViewByName(
    store$.views.get(),
    activeTabField?.field?.name ?? ''
  );

  const record = store$.detail.row.raw.get()?.[
    activeTabField?.field?.name ?? ''
  ] as RecordType | undefined;

  const row = record
    ? makeData(store$.views.get(), activeTabField?.field?.name ?? '')([record])
        .rows?.[0]
    : undefined;

  const form = store$.detail.form.get();

  const activeTabView = getViewByName(
    store$.views.get(),
    activeTabField.field?.name ?? ''
  );

  if (!activeTabViewConfig) {
    return null;
  }
  if (!row) {
    return null;
  }
  if (!activeTabView) throw new Error('Tabs Helper: No view found');

  const viewConfigManager = new BaseViewConfigManager(activeTabViewConfig);

  const viewFields =
    viewConfigManager
      ?.getViewFieldList?.()
      .filter((f) => f.hideFromForm !== true && !f.isList) ?? [];

  const { uiViewConfig } = viewRegistry.getView(
    viewConfigManager.getViewName()
  );

  const getAllPrimitiveFormFields = () => {
    return viewFields
      .filter((f) => !f.relation && !f.enum && !f.isDateField)
      .map((field) => {
        const icon =
          uiViewConfig?.[viewConfigManager.getTableName()].fields?.[field.name]
            ?.component?.icon;

        const value = row ? row?.raw?.[field.name] : undefined;

        const label = getFieldLabel(field, true) ?? '';
        return {
          label,
          field,
          id: field.name,
          icon: icon ? icon : undefined,
          value: row ? value : undefined,
        } satisfies CommandformItem;
      });
  };

  const complexFields = viewFields
    .filter((f) => f.hideFromForm !== true)
    .filter((field) => field.relation || field.enum || field.type === 'Date');

  const getComplexFormFields = () => {
    return complexFields.map((field) => {
      const icon =
        uiViewConfig?.[viewConfigManager.getTableName()].fields?.[field.name]
          ?.component?.icon;

      let value = row ? row?.raw?.[field.name] : undefined;
      const label = Array.isArray(value) ? '' : value?.id ? value.label : value;

      const asRows =
        typeof value === 'object'
          ? makeData(
              store$.views.get(),
              field.name
            )(Array.isArray(value) ? value : [value]).rows
          : value;

      value = Array.isArray(value)
        ? asRows
        : Array.isArray(asRows)
        ? asRows[0]
        : value;

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

  const _updateRowValue = (field: FieldConfig, value: unknown) => {
    if (!row) return;

    const data = makeData(
      store$.views.get(),
      activeTabField.field?.name ?? ''
    )([{ ...row.raw, [field.name]: value }]);

    const updatedRow = data.rows?.[0];

    return updatedRow as Row;
  };

  const updateRow = (field: FieldConfig, value: unknown) => {
    const rowOfSub = _updateRowValue(field, value);

    if (!rowOfSub || !activeTabField.field?.name) return;

    const updatedRowData = {
      ...store$.detail.row.raw.get(),
      [activeTabField.field.name]: rowOfSub.raw,
    };

    const row = makeData(
      store$.views.get(),
      store$.detail.viewConfigManager.getViewName()
    )([updatedRowData]).rows?.[0];

    store$.detail.row.set(row);

    row &&
      store$.detail.row.set(
        copyRow(
          row,
          store$.detail.viewConfigManager.get() as BaseViewConfigManagerInterface
        )
      );

    store$.detail.form.dirtyField.set(field);
    store$.detail.form.dirtyValue.set(value as string | number);
  };

  // TODO Remove duplicated code
  const getFormState = () => {
    if (!row?.raw) return null;
    const errors = viewConfigManager.validateRecord(row?.raw);

    if (errors) {
      console.debug('Form State Errors: ', errors);
    }

    return {
      isReady: !errors,
      isFieldReady: (field: FieldConfig) => {
        const fieldErrors = errors?.[field.name];
        if (!fieldErrors) return true;
        return false;
      },
      errors: errors ?? {},
    } satisfies FormState;
  };

  const saveIfDirty = (field: FieldConfig) => {
    const { dirtyField, dirtyValue } = form ?? {};

    if (field.name !== dirtyField?.name || !dirtyField.name) return;

    if (field.isRequired && dirtyValue === undefined) {
      throw new Error(`Field ${field.name} is required`);
    }

    if (!getFormState()?.isFieldReady(field)) {
      throw new Error(`Field ${field.name} is not ready`);
    }

    store$.updateRecordMutation({
      field,
      row,
      valueRow: makeRowFromValue(dirtyValue?.toString() || '', field),
    });

    store$.detail.form.dirtyField.set(undefined);
    store$.detail.form.dirtyValue.set(undefined);
  };

  return {
    updateRow,
    saveIfDirty,
    activeTabField,
    detailTabsFields,
    activeTabPrimitiveFields: getAllPrimitiveFormFields(),
    activeTabComplexFields: getComplexFormFields(),
    row,
  } satisfies {
    row: Row;
    updateRow: (field: FieldConfig, value: unknown) => void;
    saveIfDirty: (field: FieldConfig) => void;
    activeTabField: CommandformItem;
    detailTabsFields: CommandformItem[];
    activeTabPrimitiveFields: CommandformItem[];
    activeTabComplexFields: CommandformItem[];
  };
};
