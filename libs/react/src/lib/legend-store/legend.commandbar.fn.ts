import { FieldConfig, Row } from '@apps-next/core';
import { handleCommand } from '../commands';
import { commands } from '../commands/commands';
import { comboboxDebouncedQuery$ } from './legend.combobox.helper';
import { xSelect } from './legend.select-state';
import { LegendStore, StoreFn } from './legend.store.types';
import { Observable } from '@legendapp/state';

export const setCommandbarQuery = (
  store$: Observable<LegendStore>,
  query?: string
) => {
  if (!query) {
    store$.commandbar.query.set('');
    return;
  }

  store$.commandbar.query.set(query.trim());
};

export const commandbarOpen: StoreFn<'commandbarOpen'> = (store$) => (row) => {
  store$.openSpecificModal('commandbar', () => {
    // first set row -> then open | important!
    row && store$.commandbar.activeRow.set(row);
    store$.commandbar.open.set(true);
  });
};

export const commandbarClose: StoreFn<'commandbarClose'> = (store$) => () => {
  store$.commandbar.open.set(false);
  setCommandbarQuery(store$, '');
  store$.commandbar.groups.set([]);
  store$.commandbar.selectedViewField.set(undefined);
  store$.combobox.query.set('');
  store$.commandbar.error.set(undefined);
  store$.commandbar.selectedViewField.set(undefined);
  store$.commandbar.activeOpen.set(undefined);
  comboboxDebouncedQuery$.set('');
  store$.commandbar.activeRow.set(undefined);
};

export const commandbarOpenWithFieldValue: StoreFn<
  'commandbarOpenWithFieldValue'
> = (store$) => (field: FieldConfig, row: Row) => {
  const value = row?.getValue?.(field.name);
  store$.commandbarOpen(row);

  if ((value as Row | undefined)?.id) {
    setCommandbarQuery(store$);
    store$.commandbar.activeItem.set(row);
  } else if (field.type === 'Enum') {
    store$.commandbar.activeItem.set(row);
  } else if (typeof value !== 'object') {
    setCommandbarQuery(store$, value);
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

    setCommandbarQuery(store$, query);

    store$.combobox.query.set(query);
  };

export const commandbarSetValue: StoreFn<'commandbarSetValue'> =
  (store$) => (item) => {
    store$.commandbar.activeItem.set(item);
  };

export const commandbarSelectItem: StoreFn<'commandbarSelectItem'> =
  (store$) => async (item) => {
    const selectedViewField = store$.commandbar.selectedViewField.get();

    const isKeyPress = item.id === 'key-press';
    const pressedKey = isKeyPress && item.label;
    const isNumber = pressedKey && !isNaN(Number(pressedKey));
    const isSpace = pressedKey && pressedKey === ' ';

    if (pressedKey) {
      if (selectedViewField?.enum && isNumber) {
        const enumValue =
          selectedViewField.enum.values[+pressedKey as unknown as number];

        if (!enumValue) return;

        const command = commands.makeUpdateRecordAttributeCommand({
          id: enumValue.name,
          label: enumValue.name,
        });

        handleCommand(command);

        return;
      } else if (
        selectedViewField?.relation?.type === 'manyToMany' &&
        isSpace
      ) {
        const row = store$.commandbar.activeRow.get();
        if (!row) return;

        const activeItem = store$.commandbar.activeItem.get();
        if (!activeItem) return;

        const command = commands.makeSelectRelationalOptionCommand({
          ...activeItem,
        });

        handleCommand(command);

        return;
      } else {
        return;
      }
    }

    if (handleCommand(item)) return;

    throw new Error('Command not found');
  };
