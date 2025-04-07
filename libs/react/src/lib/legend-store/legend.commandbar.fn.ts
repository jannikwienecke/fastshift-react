import {
  _log,
  ADD_NEW_OPTION,
  FieldConfig,
  getViewByName,
  makeRowFromValue,
  Row,
} from '@apps-next/core';
import {
  dateUtils,
  operatorMap,
  SELECT_FILTER_DATE,
} from '../ui-adapter/filter-adapter';
import { comboboxDebouncedQuery$ } from './legend.combobox.helper';
import { StoreFn } from './legend.store.types';
import { xSelect } from './legend.select-state';
import { comboboxStore$ } from './legend.store.derived.combobox';

export const commandbarOpen: StoreFn<'commandbarOpen'> = (store$) => (row) => {
  store$.openSpecificModal('commandbar', () => {
    store$.commandbar.open.set(true);
    row && store$.commandbar.activeRow.set(row);
  });
};

export const commandbarClose: StoreFn<'commandbarClose'> = (store$) => () => {
  store$.commandbar.open.set(false);
  store$.commandbar.query.set('');
  store$.commandbar.itemGroups.set([]);
  store$.commandbar.selectedViewField.set(undefined);
  store$.combobox.query.set('');
  store$.commandbar.error.set(undefined);
  // store$.list.selectedRelationField.set()
  comboboxDebouncedQuery$.set('');
};

export const commandbarOpenWithFieldValue: StoreFn<
  'commandbarOpenWithFieldValue'
> = (store$) => (field: FieldConfig, row: Row) => {
  const value = row?.getValue?.(field.name);
  store$.commandbarOpen(row);

  if ((value as Row | undefined)?.id) {
    store$.commandbar.query.set('');
    store$.commandbar.activeItem.set(row);
  } else if (field.type === 'Enum') {
    store$.commandbar.activeItem.set(row);
  } else if (typeof value !== 'object') {
    store$.commandbar.query.set(value);
    store$.commandbar.activeItem.set(row);
  } else {
    //
  }
  store$.commandbar.selectedViewField.set(field);
  xSelect.open(row, field);
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
    store$.combobox.query.set(query);
  };

export const commandbarSetValue: StoreFn<'commandbarSetValue'> =
  (store$) => (item) => {
    store$.commandbar.activeItem.set(item);
  };

export const commandbarSelectItem: StoreFn<'commandbarSelectItem'> =
  (store$) => async (item) => {
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
        const row = store$.commandbar.activeRow.get();
        if (!row) return;

        xSelect.open(row as Row, selectedViewField);
        xSelect.select(store$.commandbar.activeItem.get() as Row);

        return;
      } else {
        return;
      }
    }

    try {
      const field =
        selectedViewField ??
        store$.viewConfigManager.getFieldBy(item.id.toString());
      const row = store$.commandbar.activeRow.get();
      const value = row?.getValue?.(field.name);

      _log.debug({
        SELECTITEM: '',
        item,
        field,
        row,
        value,
        selectedViewField,
      });

      if (selectedViewField && row) {
        if (item.id === ADD_NEW_OPTION) {
          const view = getViewByName(
            store$.views.get(),
            selectedViewField.name
          );

          store$.commandformOpen(view.viewName);
          store$.commandbarClose();
          return;
        }

        if (selectedViewField.type === 'String' && query?.length) {
          const error = store$.viewConfigManager.validateField(
            selectedViewField,
            query
          );
          if (error) {
            store$.commandbar.error.showError.set(true);
            return;
          }

          store$.updateRecordMutation({
            field: selectedViewField,
            row: row as Row,
            valueRow: makeRowFromValue(query, field),
          });

          store$.commandbarClose();
          return;
        } else if (selectedViewField.type === 'Date') {
          const isSelectSpecificDate = item.id === SELECT_FILTER_DATE;

          if (isSelectSpecificDate) {
            const dateOfCurrentRow = row.getValue?.(
              selectedViewField.name
            ) as number;

            store$.datePickerDialogOpen(new Date(dateOfCurrentRow), (date) => {
              row &&
                store$.updateRecordMutation({
                  field: selectedViewField,
                  row: row as Row,
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
              row: row as Row,
              valueRow,
            });
          }

          store$.commandbarClose();
        } else if (selectedViewField.enum) {
          store$.updateRecordMutation({
            field: selectedViewField,
            row: row as Row,
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
            row: row as Row,
            valueRow: item as Row,
          });
          store$.commandbarClose();

          return;
        } else if (selectedViewField.relation) {
          if ((item as Row | undefined)?.raw) {
            xSelect.select(item as Row);
          } else {
            const row = comboboxStore$.values
              .find((v) => v.id.get() === item.id)
              ?.get();
            row && xSelect.select(row as Row);
          }

          return;
        } else {
          throw new Error('Field type not supported1');
        }
      } else if (field.type === 'Boolean' && row) {
        store$.updateRecordMutation({
          field,
          row: row as Row,
          valueRow: makeRowFromValue(!value, field),
        });

        store$.commandbarClose();
        return;
      } else {
        store$.commandbar.selectedViewField.set(field);

        xSelect.open(row as Row, field);
      }

      if (field.type === 'String') {
        store$.commandbar.query.set(value.toString());
      } else {
        store$.commandbar.query.set('');
      }
    } catch (error) {
      if (item.id === ADD_NEW_OPTION && item.viewName) {
        store$.commandformOpen(item.viewName);
        store$.commandbarClose();
      } else {
        // FEATURE -> make the commands injection system scalable
        // items groups should be set by the item itself, should carry a group-id
        // handle running handler, error handling, which props needs to be passed
        // probably the active row
        const command = store$.commands
          .get()
          .find((command) => command.id === item.id);

        if (!command) return;

        if (!command.options?.keepCommandbarOpen) {
          store$.commandbarClose();
        }

        await command.handler({
          row: store$.commandbar.activeRow.get() || undefined,
        });
      }
    }
  };
