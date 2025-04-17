import { FieldConfig, makeRowFromValue, Row } from '@apps-next/core';
import { formHelper } from './legend.form.helper';
import { store$ } from './legend.store';
import { copyRow } from './legend.utils';

export const detailFormHelper = () => {
  const view = store$.viewConfigManager.viewConfig.get();
  const row = store$.detail.row.get() as Row;

  const helper = formHelper(view, row);
  const form = store$.detail.form.get();

  const updateRow = (field: FieldConfig, value: unknown) => {
    const row = helper._updateRowValue(field, value);
    row && store$.detail.row.set(copyRow(row));
    store$.detail.form.dirtyField.set(field);
    store$.detail.form.dirtyValue.set(value as string | number);
  };

  const saveIfDirty = (field: FieldConfig) => {
    const { dirtyField, dirtyValue } = form ?? {};
    if (field.name !== dirtyField?.name || !dirtyField.name) return;

    if (field.isRequired && dirtyValue === undefined) {
      throw new Error(`Field ${field.name} is required`);
    }

    if (!helper.formState.isReady) return;

    store$.updateRecordMutation({
      field,
      row,
      valueRow: makeRowFromValue(dirtyValue?.toString() || '', field),
    });
  };

  return {
    ...helper,
    row,
    view,
    updateRow,
    saveIfDirty,
  };
};
