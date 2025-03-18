import { batch } from '@legendapp/state';
import { StoreFn } from './legend.store.types';
import { makeData } from '@apps-next/core';

export const contextMenuOpen: StoreFn<'contextMenuOpen'> =
  (store$) => (rect, record) => {
    const row = makeData(
      store$.views.get(),
      store$.viewConfigManager.getViewName()
    )([record]).rows?.[0];

    if (!row) {
      console.error('Row not found for context menu');
      return;
    }

    batch(() => {
      store$.contextMenuState.rect.set(rect);
      store$.contextMenuState.row.set(row);
    });
  };

export const contextMenuClose: StoreFn<'contextMenuClose'> = (store$) => () => {
  store$.contextMenuState.rect.set(null);
  store$.contextMenuState.row.set(null);
};

export const contextmenuDeleteRow: StoreFn<'contextmenuDeleteRow'> =
  (store$) => (row) => {
    store$.deleteRecordMutation({ row }, () => {
      store$.contextMenuClose();
    });
  };
