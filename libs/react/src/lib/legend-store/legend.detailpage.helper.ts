import {
  BaseViewConfigManagerInterface,
  FieldConfig,
  makeRowFromValue,
  Row,
  ViewConfigType,
} from '@apps-next/core';
import { formHelper } from './legend.form.helper';
import { store$ } from './legend.store';
import { copyRow } from './legend.utils';

export const detailFormHelper = () => {
  const view = store$.detail.viewConfigManager.viewConfig.get() as
    | ViewConfigType
    | undefined;
  const row = store$.detail.row.get() as Row;

  if (!view) {
    throw new Error('View is not set');
  }

  // TODO DETAIL BRANCHING
  const helper = formHelper(view, row, true);
  const form = store$.detail.form.get();

  const updateRow = (field: FieldConfig, value: unknown) => {
    const row = helper._updateRowValue(field, value);
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

  const saveIfDirty = (field: FieldConfig) => {
    const { dirtyField, dirtyValue } = form ?? {};

    if (field.name !== dirtyField?.name || !dirtyField.name) return;

    if (field.isRequired && dirtyValue === undefined) {
      throw new Error(`Field ${field.name} is required`);
    }

    if (!helper.formState?.isFieldReady(field)) return;

    store$.updateRecordMutation({
      field,
      row,
      valueRow: makeRowFromValue(dirtyValue?.toString() || '', field),
    });

    store$.detail.form.dirtyField.set(undefined);
    store$.detail.form.dirtyValue.set(undefined);
  };

  const getPropertiesFields = () => {
    return helper
      .getComplexFormFields()
      .filter(
        (f) => f.field.showInProperties || !f.field.relation?.manyToManyTable
      );
  };

  const getRelationalFields = () => {
    return (
      helper
        .getComplexFormFields()
        .filter(
          (f) =>
            f.field.relation?.manyToManyModelFields?.length &&
            !f.field.showInProperties &&
            !f.field.hide
        ) ?? []
    );
  };

  return {
    ...helper,
    row,
    view,
    updateRow,
    saveIfDirty,
    getRelationalFields,
    getPropertiesFields,
  };
};
