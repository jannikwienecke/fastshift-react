import { makeRow } from '@apps-next/core';
import { StoreFn } from './legend.store.types';

export const inputDialogSave: StoreFn<'inputDialogSave'> = (store$) => () => {
  const filterField = store$.filter.selectedField.get();
  const valueDict = store$.inputDialog.valueDict;

  if (!filterField?.name) return;

  // handle case: saving for a filter field
  const value = valueDict[filterField.name].get()?.value;
  if (!value) return;

  store$.filterSelectFilterValue(makeRow(value, value, value, filterField));
  store$.filterCloseAll();
};

export const inputDialogClose: StoreFn<'inputDialogClose'> = (store$) => () => {
  store$.filterCloseAll();
};
