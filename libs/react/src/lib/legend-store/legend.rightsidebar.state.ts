import { observable } from '@legendapp/state';
import { store$ } from './legend.store';
import { Row } from '@apps-next/core';

export const query$ = observable('');
export const tab$ = observable('');
export const listRows$ = observable<Row[]>([]);
export const listRowIds$ = observable<string[]>([]);
export const ignoreNextUpdate$ = observable(false);

store$.rightSidebar.filter.onChange((changes) => {
  const filter = changes.value;
  if (filter) {
    ignoreNextUpdate$.set(true);
  }
});

store$.dataModel.rows.onChange((changes) => {
  const rows = changes.value;

  if (ignoreNextUpdate$.get()) {
    ignoreNextUpdate$.set(false);
    return listRows$.get();
  }

  listRows$.set(rows);
});

store$.allIds.onChange((changes) => {
  const allIds = changes.value;
  if (!allIds) return;

  if (ignoreNextUpdate$.get()) {
    return listRowIds$.get();
  }

  listRowIds$.set(allIds);
});

export const getIdsOfTable = (table: string) => {
  return listRows$
    .get()
    .map((r) => {
      const valueOrValues = r.raw?.[table];
      const isArray = Array.isArray(valueOrValues);
      return isArray
        ? valueOrValues.map((v) => v.id || v)
        : valueOrValues?.id || valueOrValues;
    })
    .flat();
};
