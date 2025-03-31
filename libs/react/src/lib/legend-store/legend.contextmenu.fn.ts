import { batch } from '@legendapp/state';
import { StoreFn } from './legend.store.types';
import { makeData, makeRowFromValue, Row } from '@apps-next/core';
import { copyRow } from './legend.utils';

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
      store$.contextMenuState.row.set(copyRow(row));
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

export const contextmenuEditRow: StoreFn<'contextmenuEditRow'> =
  (store$) => (row) => {
    setTimeout(() => {
      store$.commandformOpen(
        store$.viewConfigManager.viewConfig.viewName.get()
      );

      store$.commandform.row.set(row);
    }, 0);
  };

export const contextmenuClickOnField: StoreFn<'contextmenuClickOnField'> =
  (store$) => (field) => {
    const activeRow = store$.contextMenuState.row.get();

    if (!activeRow) return;

    if (field.type === 'Boolean') {
      const value = activeRow.getValue?.(field.name);
      store$.updateRecordMutation({
        field,
        row: activeRow as Row,
        valueRow: makeRowFromValue(!value, field),
      });
      store$.contextMenuClose();
    } else {
      store$.contextMenuClose();
      store$.commandbarOpenWithFieldValue(field, activeRow as Row);
    }
  };
