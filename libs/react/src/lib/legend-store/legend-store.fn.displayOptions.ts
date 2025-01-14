import { makeRow, Row } from '@apps-next/core';
import { StoreFn } from './legend.store.types';
import { batch } from '@legendapp/state';

export const displayOptionsOpen: StoreFn<'displayOptionsOpen'> =
  (store$) => () => {
    store$.displayOptions.isOpen.set(true);
  };

export const displayOptionsOpenSorting: StoreFn<'displayOptionsOpenSorting'> =
  (store$) => (rect) => {
    store$.displayOptions.sorting.isOpen.set(true);
    store$.displayOptions.sorting.rect.set(rect);
  };

export const displayOptionsSelectField: StoreFn<'displayOptionsSelectField'> =
  (store$) => (selected) => {
    const field = store$.viewConfigManager.getFieldBy(selected.id.toString());

    batch(() => {
      store$.displayOptions.sorting.field.set(field);
      store$.displayOptions.sorting.order.set('asc');
      store$.displayOptions.sorting.isOpen.set(false);
      store$.displayOptions.sorting.rect.set(null);
    });
  };
