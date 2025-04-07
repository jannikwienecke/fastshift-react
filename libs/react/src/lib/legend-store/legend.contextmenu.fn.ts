import { batch } from '@legendapp/state';
import { StoreFn } from './legend.store.types';
import { makeData, makeRowFromValue, Row } from '@apps-next/core';
import { copyRow } from './legend.utils';
import { selectState$, xSelect } from './legend.select-state';

export const contextMenuOpen: StoreFn<'contextMenuOpen'> =
  (store$) => (rect, record) => {
    selectState$.parentRow.set(null);

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
  xSelect.close();
};

export const contextmenuDeleteRow: StoreFn<'contextmenuDeleteRow'> =
  (store$) => (row) => {
    store$.deleteRecordMutation({ row }, () => {
      store$.contextMenuClose();
    });
  };

export const contextmenuEditRow: StoreFn<'contextmenuEditRow'> =
  (store$) => (row) => {
    store$.commandformOpen(
      store$.viewConfigManager.viewConfig.viewName.get(),
      row
    );
  };

export const contextmenuClickOnField: StoreFn<'contextmenuClickOnField'> =
  (store$) => (field) => {
    const activeRow = store$.contextMenuState.row.get();

    if (!activeRow) return;

    if (field.type === 'Boolean') {
      const value = activeRow.getValue?.(field.name);
      store$.updateRecordMutation({
        field,
        row: copyRow(activeRow as Row),
        valueRow: makeRowFromValue(!value, field),
      });
      store$.contextMenuClose();
    } else {
      store$.contextMenuClose();
      store$.commandbarOpenWithFieldValue(field, copyRow(activeRow as Row));
    }
  };

export const contextmenuCopyRow: StoreFn<'contextmenuCopyRow'> =
  (store$) => (type) => {
    const row = store$.contextMenuState.row.get() as Row | undefined;
    if (!row) return;
    // copy to clipboard
    const copy = copyRow(row);

    if (type === 'id') {
      navigator.clipboard.writeText(copy.id);
    } else if (type === 'url') {
      const currentUrl = window.location.href;
      navigator.clipboard.writeText(`${currentUrl}?id=${copy.id}`);
    } else if (type === 'json') {
      navigator.clipboard.writeText(JSON.stringify(copy.raw));
    }
  };
