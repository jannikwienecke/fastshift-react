import { makeRowFromValue, Row } from '@apps-next/core';
import { StoreFn } from './legend.store.types';
import { comboboxDebouncedQuery$ } from './legend.combobox.helper';

export const commandbarOpen: StoreFn<'commandbarOpen'> = (store$) => () => {
  store$.commandbar.open.set(true);
};

export const commandbarClose: StoreFn<'commandbarClose'> = (store$) => () => {
  store$.commandbar.open.set(false);
  store$.commandbar.query.set('');
  store$.commandbar.debouncedQuery.set('');
  store$.commandbar.debouncedBy.set(0);
  store$.commandbar.itemGroups.set([]);
  store$.commandbar.selectedViewField.set(undefined);
  store$.combobox.query.set('');
  comboboxDebouncedQuery$.set('');
};
export const commandbarUpdateQuery: StoreFn<'commandbarUpdateQuery'> =
  (store$) => (query) => {
    const selectedViewField = store$.commandbar.selectedViewField.get();
    const isEnumField = selectedViewField?.type === 'Enum';
    const queryIsNumber = query && !isNaN(Number(query));

    if (isEnumField && queryIsNumber) {
      return;
    }

    store$.commandbar.query.set(query);
    store$.commandbar.debouncedQuery.set(query);
    store$.commandbar.debouncedBy.set(0);
  };
export const commandbarSelectItem: StoreFn<'commandbarSelectItem'> =
  (store$) => (item) => {
    const selectedViewField = store$.commandbar.selectedViewField.get();
    const query = store$.commandbar.query.get();

    const isKeyPress = item.id === 'key-press';
    const pressedKey = isKeyPress && item.label;
    const isNumber = pressedKey && !isNaN(Number(pressedKey));

    if (pressedKey) {
      if (selectedViewField?.enum && isNumber) {
        const enumValue =
          selectedViewField.enum.values[pressedKey as unknown as number];
        enumValue &&
          store$.commandbarSelectItem({
            id: enumValue.name,
            label: enumValue.name,
          });
        return;
      } else {
        return;
      }
    }

    try {
      const field =
        selectedViewField ??
        store$.viewConfigManager.getFieldBy(item.id.toString());
      const row = store$.list.rowInFocus.get();
      const value = row?.row?.getValue(field.name);

      if (selectedViewField && row?.row) {
        if (selectedViewField.type === 'String' && query?.length) {
          store$.updateRecordMutation({
            field: selectedViewField,
            row: row.row,
            valueRow: makeRowFromValue(query, field),
          });

          store$.commandbarClose();
          return;
        } else if (selectedViewField.enum) {
          store$.updateRecordMutation({
            field: selectedViewField,
            row: row.row,
            valueRow: makeRowFromValue(item.id as string | number, field),
          });
          store$.commandbarClose();
          return;
        } else if (
          selectedViewField.relation &&
          !selectedViewField.relation.manyToManyRelation
        ) {
          store$.updateRecordMutation({
            field: selectedViewField,
            row: row.row,
            valueRow: item as Row,
          });
          store$.commandbarClose();

          return;
        } else {
          throw new Error('Field type not supported1');
        }
      } else {
        store$.commandbar.selectedViewField.set(field);
      }

      if (field.type === 'String') {
        store$.commandbar.query.set(value.toString());
      } else {
        store$.commandbar.query.set('');
      }
    } catch (error) {
      console.log('onSelect', item);
    }
  };
