import {
  convertDisplayOptionsForBackend,
  convertFiltersForBackend,
  Row,
} from '@apps-next/core';
import { applyDisplayOptions } from './legend.local.display-options';
import { applyFilter } from './legend.local.filtering';
import { store$ } from './legend.store';

export const filterRowsByShowDeleted = (rows: Row[]) => {
  const showDeleted = store$.displayOptions.showDeleted.get();
  const softDeleteField =
    store$.viewConfigManager.getSoftDeleteIndexField()?.field;

  const filtered = rows.filter((row) => {
    if (showDeleted) return true;

    const value = softDeleteField && row.getValue(softDeleteField ?? '');
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

// const filters = store$.filter.filters.get();
// const displayOptions = store$.displayOptions.get();

// const parsedFilters = viewConfigManager.localModeEnabled
//   ? ''
//   : convertFiltersForBackend(filters);
// const parsedDisplayOptions = viewConfigManager.localModeEnabled
//   ? ''
//   : convertDisplayOptionsForBackend(displayOptions);

export const getParsedViewSettings = () => {
  const filters = store$.filter.filters.get();
  const displayOptions = store$.displayOptions.get();

  const parsedDisplayOptions = convertDisplayOptionsForBackend(displayOptions);

  return {
    filters: convertFiltersForBackend(filters),
    displayOptions: parsedDisplayOptions,
  } satisfies {
    filters?: string;
    displayOptions?: string;
  };
};
