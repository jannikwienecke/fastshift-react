import { RecordType } from '@apps-next/core';
import { xSelect } from './legend.select-state';
import { StoreFn } from './legend.store.types';
import { copyRow } from './legend.utils';

export const listSelect: StoreFn<'selectListItem'> =
  (store$) => (record: RecordType) => {
    const allSelected = store$.list.selected.get();

    if (allSelected.map((r) => r['id']).includes(record['id'])) {
      store$.list.selected.set(
        allSelected.filter((r) => r['id'] !== record['id'])
      );
    } else {
      store$.list.selected.set([...allSelected, record]);
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
