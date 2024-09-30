import { makeRow } from '@apps-next/core';
import {
  filterCloseAll,
  filterSelectFilterValue,
} from './legend.store.fn.filter';
import { StoreFn } from './legend.store.types';

export const inputDialogSave: StoreFn<'inputDialogSave'> = (store$) => () => {
  const filterField = store$.filter.selectedField.get();
  const valueDict = store$.inputDialog.valueDict;

  if (!filterField?.name) return;

  // handle case: saving for a filter field
  const value = valueDict[filterField.name].get()?.value;
  if (!value) return;

  filterSelectFilterValue(store$)(makeRow(value, value, value, filterField));
  filterCloseAll(store$)();
};

export const inputDialogClose: StoreFn<'inputDialogClose'> = (store$) => () => {
  filterCloseAll(store$)();
};
