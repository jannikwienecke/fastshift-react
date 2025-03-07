import { makeRow, Row } from '@apps-next/core';
import { StoreFn } from './legend.store.types';
import { batch } from '@legendapp/state';

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
    const field = store$.viewConfigManager.getFieldBy(selected.id.toString());

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
  console.log('displayOptionsSelectViewField', field);

  const prevSelectedViewFields = store$.displayOptions.viewField.selected.get();

  const selected = prevSelectedViewFields.includes(field.id)
    ? prevSelectedViewFields.filter((id) => id !== field.id)
    : [...prevSelectedViewFields, field.id];

  store$.displayOptions.viewField.selected.set(selected);
};
