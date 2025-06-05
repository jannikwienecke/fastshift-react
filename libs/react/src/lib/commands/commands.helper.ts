import {
  _filter,
  CommandbarItemHandler,
  CommandbarProps,
  getViewLabel,
  makeRowFromValue,
  Row,
  t,
  ViewConfigType,
} from '@apps-next/core';
import Fuse from 'fuse.js';
import {
  currentView$,
  getViewConfigManager,
  isDetail,
  store$,
} from '../legend-store';
import { comboboxDebouncedQuery$ } from '../legend-store/legend.combobox.helper';
import { xSelect } from '../legend-store/legend.select-state';
import { dateUtils, operatorMap } from '../ui-adapter/filter-adapter';

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

const filterCommandGroups = (groups: CommandbarProps['groups']) => {
  const viewFieldOrUndefined = store$.commandbar.selectedViewField.get();
  const standardQuery = store$.commandbar.query.get() ?? '';
  const debouncedQuery = comboboxDebouncedQuery$.get();
  const query =
    viewFieldOrUndefined && viewFieldOrUndefined.relation
      ? debouncedQuery
      : standardQuery;

  const filteredGroups = groups
    .map((group) => {
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

  const options = {
    keys: ['label'],
    threshold: 0.3,
    distance: 100,
    includeScore: true,
  };

  const currentTableName = getViewConfigManager()?.getTableName();

  filteredGroups.sort((a, b) => {
    if (!query) return 0;

    if (a.header === '') return -1;
    if (b.header === '') return 1;

    const aHasCurrentTableName = a.items.some(
      (item) => item.tablename === currentTableName
    );
    const bHasCurrentTableName = b.items.some(
      (item) => item.tablename === currentTableName
    );

    if (aHasCurrentTableName && !bHasCurrentTableName) return -1;
    if (!aHasCurrentTableName && bHasCurrentTableName) return 1;

    const aFuse = new Fuse(a.items, options);
    const bFuse = new Fuse(b.items, options);

    const aScore = aFuse
      .search(query)
      .reduce((acc, item) => acc + (item.score || 0), 0);
    const bScore = bFuse
      .search(query)
      .reduce((acc, item) => acc + (item.score || 0), 0);

    return aScore - bScore;
  });

  return filteredGroups;
};

export const getViewName = () => getViewConfigManager()?.getViewName();
export const getTableName = () => getViewConfigManager()?.getTableName();

export const getViewLabelOf = (translationString: string) => {
  const view = isDetail()
    ? store$.detail.viewConfigManager.viewConfig.get()
    : currentView$.get();
  if (!view) return translationString;

  return t(translationString, {
    name: getViewLabel(view as ViewConfigType, true),
  });
};

export const getCommandsType = () => store$.commandsDisplay.type.get();

export const commandsHelper = {
  openCommandbarDatePicker,
  getParsedDateRowForMutation,
  onError,
  isInternalView,
  filterCommandGroups,
  getViewName,
};
