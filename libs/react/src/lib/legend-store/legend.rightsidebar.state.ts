import { observable } from '@legendapp/state';
import { store$ } from './legend.store';
import { Row } from '@apps-next/core';
import { currentView$ } from './legend.shared.derived';

export const query$ = observable('');
export const tab$ = observable('');
export const listRows$ = observable<Row[]>([]);
export const listRowIds$ = observable<string[]>([]);
export const ignoreNextUpdate$ = observable(false);
export const isDone$ = observable(false);

store$.relationalFilterData.onChange((changes) => {
  const relationalFilterData = changes.value;
  const keys = Object.keys(relationalFilterData);
  if (keys.includes(tab$.get())) return;

  tab$.set(keys[0]);
});

store$.rightSidebar.filter.onChange((changes) => {
  const filter = changes.value;
  if (filter) {
    ignoreNextUpdate$.set(true);
  } else {
    ignoreNextUpdate$.set(false);
  }
});

store$.dataModel.rows.onChange((changes) => {
  const rows = changes.value;

  if (ignoreNextUpdate$.get()) {
    ignoreNextUpdate$.set(false);
    return listRows$.get();
  }

  setTimeout(() => {
    isDone$.set(store$.fetchMore.isDone.get());
  }, 0);

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

export const getRightSidebarFilterFields = () => {
  if (!currentView$.get()) return [];

  const keysFor = Object.values(currentView$?.viewFields.get() ?? {}).filter(
    (f) => f.useAsSidebarFilter
  );

  return keysFor;
};

export const hasRightSidebarFiltering = () => {
  return getRightSidebarFilterFields().length > 0;
};
