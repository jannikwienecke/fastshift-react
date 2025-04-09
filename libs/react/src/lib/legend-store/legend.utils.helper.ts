import { Row } from '@apps-next/core';
import { store$ } from './legend.store';
import { applyFilter } from './legend.local.filtering';
import { applyDisplayOptions } from './legend.local.display-options';

export const filterRowsByShowDeleted = (rows: Row[]) => {
  const showDeleted = store$.displayOptions.showDeleted.get();
  const softDeleteField =
    store$.viewConfigManager.getSoftDeleteIndexField()?.field;

  const filtered = rows.filter((row) => {
    const value = row.getValue(softDeleteField ?? '');
    return showDeleted ? true : value !== true;
  });

  return filtered;
};

export const setGlobalDataModel = (rows: Row[]) => {
  const filteredRows = filterRowsByShowDeleted(rows);

  //   datamodel has either ALL or not DELETED rows based on the config
  store$.dataModel.set((prev) => {
    return {
      ...prev,
      rows: filteredRows,
    };
  });

  //   backup has ALL rows
  store$.dataModelBackup.rows.set(rows);

  applyFilter(store$, store$.filter.filters.get());

  if (store$.viewConfigManager.localModeEnabled) {
    applyDisplayOptions(store$, store$.displayOptions.get());
  }
};
