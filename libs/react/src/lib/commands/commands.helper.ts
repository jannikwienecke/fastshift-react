import {
  _filter,
  CommandbarItem,
  CommandbarItemHandler,
  CommandbarProps,
  makeRowFromValue,
  Row,
} from '@apps-next/core';
import { dateUtils, operatorMap } from '../ui-adapter/filter-adapter';
import { store$ } from '../legend-store';
import { xSelect } from '../legend-store/legend.select-state';

type FnArgsOfCommand = Parameters<CommandbarItemHandler>[0];

export const getParsedDateRowForMutation = (options: FnArgsOfCommand) => {
  if (!options.row || !options.field || !options.value) return null;

  const parsed = dateUtils.parseOption(
    options.value?.id.toString(),
    operatorMap.is
  );

  const { start, end } = dateUtils.getStartAndEndDate(parsed);

  start?.setHours(2, 0, 0, 0);

  if (!start && !end) return null;

  const valueRow = makeRowFromValue(
    end ? end.getTime() : start?.getTime() ?? 0,
    options.field
  );

  return valueRow;
};

const onError = (options: FnArgsOfCommand) => {
  const { row, field } = options;
  if (!row || !field) return;
  store$.commandbarOpen(row);
  store$.commandbar.selectedViewField.set(field);
  xSelect.open(row as Row, field);
};

const openCommandbarDatePicker = (options: FnArgsOfCommand) => {
  if (!options.row || !options.field) return;

  const { row, field } = options;
  const dateOfCurrentRow = row.getValue?.(field.name) as number;

  store$.datePickerDialogOpen(
    dateOfCurrentRow ? new Date(dateOfCurrentRow) : undefined,
    (date) => {
      row &&
        store$.updateRecordMutation(
          {
            field,
            row: row as Row,
            valueRow: makeRowFromValue(date.getTime(), field),
          },
          undefined,
          () => onError(options)
        );

      store$.commandbarClose();
      store$.datePickerDialogClose();
    }
  );
};

const isInternalView = (viewName: string) => {
  const internalViewNames = ['views'];

  return internalViewNames.includes(viewName);
};

const getUserStoreCommands = (): CommandbarItem[] => {
  const storeCommands = store$.commands.get();

  return storeCommands.map((command) => {
    return {
      ...command,
      command: 'user-store-command',
    } satisfies CommandbarItem;
  });
};

const filterCommandGroups = (groups: CommandbarProps['groups']) => {
  return groups
    .map((group) => {
      const query = store$.commandbar.query.get();
      if (!query) return group;

      const itemsOfGroups = group.items;

      const filteredCommands = _filter(itemsOfGroups, ['label']).withQuery(
        query
      );

      return {
        ...group,
        items: filteredCommands,
      };
    })
    .filter((g) => g.items.length > 0) satisfies CommandbarProps['groups'];
};

export const commandsHelper = {
  openCommandbarDatePicker,
  getParsedDateRowForMutation,
  onError,
  isInternalView,
  getUserStoreCommands,
  filterCommandGroups,
};
