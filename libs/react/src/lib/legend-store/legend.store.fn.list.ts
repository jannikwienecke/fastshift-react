import { makeData, RecordType } from '@apps-next/core';
import { xSelect } from './legend.select-state';
import { StoreFn } from './legend.store.types';
import { copyRow } from './legend.utils';
import { currentView$ } from './legend.shared.derived';

export const listSelect: StoreFn<'selectListItem'> =
  (store$) => (record: RecordType) => {
    const row = makeData(
      store$.views.get(),
      currentView$.get().viewName
    )([record])?.rows?.[0];

    const allSelected = store$.list.selected.get();

    if (allSelected.map((r) => r['id']).includes(row.id)) {
      store$.list.selected.set(allSelected.filter((r) => r['id'] !== row.id));
    } else {
      store$.list.selected.set([...allSelected, row]);
    }
  };

export const listSelectRelationField: StoreFn<'selectRelationField'> =
  (store$) => (props) => {
    store$.list.selectedRelationField.set({
      ...props,
      row: copyRow(props.row),
    });

    xSelect.open(props.row, props.field);
  };

export const listDeselectRelationField: StoreFn<'deselectRelationField'> =
  (store$) => () => {
    store$.list.selectedRelationField.set(undefined);
  };

export const listContextMenuItem: StoreFn<'onContextMenuListItem'> =
  (store$) => (record: RecordType, rect: DOMRect) => {
    store$.contextMenuOpen(rect, record);
  };
