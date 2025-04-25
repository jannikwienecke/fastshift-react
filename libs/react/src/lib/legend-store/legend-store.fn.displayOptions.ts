import { NO_GROUPING_FIELD, NO_SORTING_FIELD } from '@apps-next/core';
import { batch } from '@legendapp/state';
import { StoreFn } from './legend.store.types';

export const displayOptionsOpen: StoreFn<'displayOptionsOpen'> =
  (store$) => () => {
    store$.displayOptions.isOpen.set(true);
  };

export const displayOptionsClose: StoreFn<'displayOptionsClose'> =
  (store$) => () => {
    store$.displayOptions.isOpen.set(false);
    store$.displayOptionsCloseCombobox();
  };

export const displayOptionsOpenSorting: StoreFn<'displayOptionsOpenSorting'> =
  (store$) => (rect) => {
    store$.displayOptions.sorting.isOpen.set(true);
    store$.displayOptions.sorting.rect.set(rect);
  };

export const displayOptionsOpenGrouping: StoreFn<
  'displayOptionsOpenGrouping'
> = (store$) => (rect) => {
  store$.displayOptions.grouping.isOpen.set(true);
  store$.displayOptions.grouping.rect.set(rect);
};

export const displayOptionsCloseCombobox: StoreFn<
  'displayOptionsCloseCombobox'
> = (store$) => () => {
  store$.displayOptions.sorting.isOpen.set(false);
  store$.displayOptions.grouping.isOpen.set(false);

  store$.displayOptions.sorting.rect.set(null);
  store$.displayOptions.grouping.rect.set(null);
};

export const displayOptionsSelectField: StoreFn<'displayOptionsSelectField'> =
  (store$) => (selected) => {
    const isNoGrouping = selected.id === NO_GROUPING_FIELD.name;
    const isNoSorting = selected.id === NO_SORTING_FIELD.name;

    if (isNoGrouping) {
      batch(() => {
        store$.displayOptions.grouping.isOpen.set(false);
        store$.displayOptions.grouping.rect.set(null);
        store$.displayOptions.grouping.field.set(undefined);
      });
    } else if (isNoSorting) {
      batch(() => {
        store$.displayOptions.sorting.isOpen.set(false);
        store$.displayOptions.sorting.rect.set(null);
        store$.displayOptions.sorting.field.set(undefined);
      });
    }

    const field = isNoGrouping
      ? NO_GROUPING_FIELD
      : isNoSorting
      ? NO_SORTING_FIELD
      : store$.viewConfigManager.getFieldBy(selected.id.toString());

    const sorting = store$.displayOptions.sorting;
    const grouping = store$.displayOptions.grouping;

    batch(() => {
      if (sorting.isOpen.get()) {
        sorting.field.set(field);
        sorting.order.set('asc');
      } else if (grouping.isOpen.get()) {
        grouping.field.set(field);
      }

      sorting.isOpen.set(false);
      sorting.rect.set(null);
      grouping.isOpen.set(false);
      grouping.rect.set(null);
    });
  };

export const displayOptionsSelectViewField: StoreFn<
  'displayOptionsSelectViewField'
> = (store$) => (field) => {
  const prevSelectedViewFields = store$.displayOptions.viewField.hidden.get();
  const allFields = store$.displayOptions.viewField.allFields.get();

  if (prevSelectedViewFields === null || prevSelectedViewFields === undefined) {
    store$.displayOptions.viewField.hidden.set(
      allFields?.filter((f) => f !== field.id).map((f) => f)
    );
    return;
  }

  const selected = prevSelectedViewFields.includes(field.id)
    ? prevSelectedViewFields.filter((id) => id !== field.id)
    : [...prevSelectedViewFields, field.id];

  store$.displayOptions.viewField.hidden.set(selected);
};

export const displayOptionsToggleShowEmptyGroups: StoreFn<
  'displayOptionsToggleShowEmptyGroups'
> = (store$) => (checked) => {
  // const showEmptyGroups = store$.displayOptions.showEmptyGroups.get();
  store$.displayOptions.showEmptyGroups.set(checked);
};

export const displayOptionsToggleShowDeleted: StoreFn<
  'displayOptionsToggleShowDeleted'
> = (store$) => (checked) => {
  store$.displayOptions.showDeleted.set(checked);
};

export const displayOptionsReset: StoreFn<'displayOptionsReset'> =
  (store$) => () => {
    store$.displayOptions.grouping.field.set(undefined);
    store$.displayOptions.sorting.field.set(undefined);
    store$.displayOptions.viewField.hidden.set(
      store$.viewConfigManager.getViewFieldList?.().map((field) => field.name)
    );
    store$.displayOptions.showEmptyGroups.set(true);
  };

export const displayOptionsToggleSorting: StoreFn<
  'displayOptionsToggleSorting'
> = (store$) => () => {
  const sorting = store$.displayOptions.sorting;
  const field = sorting.field.get();

  if (field) {
    const order = sorting.order.get() === 'asc' ? 'desc' : 'asc';
    sorting.order.set(order);
  } else {
    //
  }
};
