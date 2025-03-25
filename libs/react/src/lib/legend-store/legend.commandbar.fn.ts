import { makeRowFromValue, Row, TOGGLE_FIELD_LABEL } from '@apps-next/core';
import { StoreFn } from './legend.store.types';
import { comboboxDebouncedQuery$ } from './legend.combobox.helper';
import {
  dateUtils,
  operatorMap,
  SELECT_FILTER_DATE,
} from '../ui-adapter/filter-adapter';

export const commandbarOpen: StoreFn<'commandbarOpen'> = (store$) => () => {
  store$.commandbar.open.set(true);
};

export const commandbarClose: StoreFn<'commandbarClose'> = (store$) => () => {
  store$.commandbar.open.set(false);
  store$.commandbar.query.set('');
  store$.commandbar.itemGroups.set([]);
  store$.commandbar.selectedViewField.set(undefined);
  store$.combobox.query.set('');
  comboboxDebouncedQuery$.set('');
};

export const commandbarUpdateQuery: StoreFn<'commandbarUpdateQuery'> =
  (store$) => (query) => {
    const selectedViewField = store$.commandbar.selectedViewField.get();
    const isEnumField = selectedViewField?.type === 'Enum';
    const isManyToManyField =
      selectedViewField?.relation?.type === 'manyToMany';

    const lastChar = query?.slice(-1);

    const queryIsNumber = lastChar && !isNaN(Number(lastChar));
    const queryIsSpace = lastChar && lastChar === ' ';

    if ((isEnumField && queryIsNumber) || (isManyToManyField && queryIsSpace)) {
      return;
    }

    store$.commandbar.query.set(query);
  };

export const commandbarSetValue: StoreFn<'commandbarSetValue'> =
  (store$) => (item) => {
    store$.commandbar.activeItem.set(item);
  };

export const commandbarSelectItem: StoreFn<'commandbarSelectItem'> =
  (store$) => (item) => {
    const selectedViewField = store$.commandbar.selectedViewField.get();
    const query = store$.commandbar.query.get();

    const isKeyPress = item.id === 'key-press';
    const pressedKey = isKeyPress && item.label;
    const isNumber = pressedKey && !isNaN(Number(pressedKey));
    const isSpace = pressedKey && pressedKey === ' ';

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
      } else if (
        selectedViewField?.relation?.type === 'manyToMany' &&
        isSpace
      ) {
        const row = store$.list.rowInFocus.get();
        if (!row?.row) return;

        const existingRows = row.row.getValue(selectedViewField.name) as Row[];

        store$.selectRowsMutation({
          field: selectedViewField,
          row: row.row,
          checkedRow: store$.commandbar.activeItem.get() as Row,
          existingRows: existingRows,
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

      console.log({
        SELECTITEM: '',
        item,
        field,
        row,
        value,
        selectedViewField,
      });

      if (selectedViewField && row?.row) {
        if (selectedViewField.type === 'String' && query?.length) {
          store$.updateRecordMutation({
            field: selectedViewField,
            row: row.row,
            valueRow: makeRowFromValue(query, field),
          });

          store$.commandbarClose();
          return;
        } else if (selectedViewField.type === 'Date') {
          const isSelectSpecificDate = item.id === SELECT_FILTER_DATE;

          if (isSelectSpecificDate) {
            const dateOfCurrentRow = row.row.getValue(
              selectedViewField.name
            ) as number;

            store$.datePickerDialogOpen(new Date(dateOfCurrentRow), (date) => {
              row.row &&
                store$.updateRecordMutation({
                  field: selectedViewField,
                  row: row.row,
                  valueRow: makeRowFromValue(date.getTime(), field),
                });

              store$.commandbarClose();
              store$.datePickerDialogClose();
            });
            return;
          } else {
            const parsed = dateUtils.parseOption(
              item.id.toString(),
              operatorMap.is
            );
            const { start } = dateUtils.getStartAndEndDate(parsed);
            start?.setHours(2, 0, 0, 0);

            if (!start) {
              store$.commandbarClose();
              return;
            }

            const valueRow = makeRowFromValue(start?.getTime(), field);
            store$.updateRecordMutation({
              field: selectedViewField,
              row: row.row,
              valueRow,
            });
          }

          store$.commandbarClose();
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
        } else if (selectedViewField.relation) {
          const existingRows = row.row.getValue(
            selectedViewField.name
          ) as Row[];

          store$.selectRowsMutation({
            field: selectedViewField,
            row: row.row,
            checkedRow: item as Row,
            existingRows: existingRows,
          });
          store$.commandbarClose();

          return;
        } else {
          throw new Error('Field type not supported1');
        }
      } else if (field.type === 'Boolean' && row?.row) {
        store$.updateRecordMutation({
          field,
          row: row.row,
          valueRow: makeRowFromValue(!value, field),
        });

        store$.commandbarClose();
        return;
      } else {
        store$.commandbar.selectedViewField.set(field);
      }

      if (field.type === 'String') {
        store$.commandbar.query.set(value.toString());
      } else {
        store$.commandbar.query.set('');
      }
    } catch (error) {
      throw new Error('Field type not supported2');
    }
  };
