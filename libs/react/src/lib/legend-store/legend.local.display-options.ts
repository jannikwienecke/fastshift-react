import { DisplayOptionsUiType, makeData, sortRows } from '@apps-next/core';
import { Observable } from '@legendapp/state';
import { applyFilter } from './legend.local.filtering';
import { store$ } from './legend.store';
import { LegendStore } from './legend.store.types';

const _sortRows = () => {
  const rows = store$.dataModel.rows.get().map((r) => r.raw);

  const sortedRows = sortRows(
    rows,
    store$.views.get(),
    store$.displayOptions.sorting.get()
  );

  const sorted = makeData(
    store$.views.get(),
    store$.viewConfigManager.getViewName()
  )([...sortedRows]).rows;

  return sorted;
};

const _sortRowsBackup = () => {
  const rows = store$.dataModelBackup.rows.get().map((r) => r.raw);

  const sortedRows = sortRows(
    rows,
    store$.views.get(),
    store$.displayOptions.sorting.get()
  );

  const sorted = makeData(
    store$.views.get(),
    store$.viewConfigManager.getViewName()
  )([...sortedRows]).rows;

  return sorted;
};

export const applyDisplayOptions = (
  store$: Observable<LegendStore>,
  displayOptions: DisplayOptionsUiType
) => {
  applyFilter(store$, store$.filter.filters.get());

  const rows = _sortRows();
  const rowsBackup = _sortRowsBackup();

  store$.dataModel.rows.set(rows);
  store$.dataModelBackup.rows.set(rowsBackup);
};

export const addLocalDisplayOptionsHandling = (
  store$: Observable<LegendStore>
) => {
  store$.displayOptions.sorting.field.onChange((changes) => {
    if (!changes.value) return;

    const prevAtPath = changes.changes[0].prevAtPath;
    if (!prevAtPath) return;

    applyDisplayOptions(store$, store$.displayOptions.get());
  });
  store$.displayOptions.sorting.order.onChange((changes) => {
    if (!changes.value) return;
    const prevAtPath = changes.changes[0].prevAtPath;
    if (!prevAtPath) return;

    applyDisplayOptions(store$, store$.displayOptions.get());
  });
  store$.displayOptions.showDeleted.onChange((changes) => {
    const prevAtPath = changes.changes[0].prevAtPath;
    if (!prevAtPath) return;

    applyDisplayOptions(store$, store$.displayOptions.get());
  });
};
