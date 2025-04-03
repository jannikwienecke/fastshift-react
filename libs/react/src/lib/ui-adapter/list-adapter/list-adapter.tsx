import {
  DataModelNew,
  MakeListPropsOptions,
  ListItem,
  ListProps,
  RecordType,
  Row,
  makeRowFromValue,
  FieldConfig,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from '../../legend-store/legend.store.js';
import { Icon } from '../../ui-components/render-icon';
import { ListFieldValue } from '../../ui-components/render-list-field-value';
import { derviedDisplayOptions } from '../../legend-store/legend.store.derived.displayOptions.js';
import { copyRow, hasOpenDialog$ } from '../../legend-store/legend.utils.js';

export const listItems$ = observable<ListProps['items']>([]);

const focusedRow$ = observable({
  row: null as Row | null,
  hover: false,
  focus: false,
});

const timeout$ = observable<number | null>(null);

focusedRow$.onChange((state) => {
  const timeout = timeout$.get();
  const commandbarIsOpen = store$.commandbar.open.get();
  const commandformIsOpen = store$.commandform.open.get();
  const contextmenuIsOpen = store$.contextMenuState.rect.get() !== null;
  const filterIsOpen = store$.filter.open.get();
  const displayOptionsIsOpen = store$.displayOptions.isOpen.get();
  if (
    commandbarIsOpen ||
    commandformIsOpen ||
    contextmenuIsOpen ||
    filterIsOpen ||
    displayOptionsIsOpen
  ) {
    return;
  }

  if (state.value.row && !store$.list.rowInFocus.hover.get()) {
    store$.list.rowInFocus.set({
      row: state.value.row,
      hover: true,
      focus: false,
    });

    return;
  }

  if (timeout) {
    clearTimeout(timeout);
    timeout$.set(null);
  }

  if (state.value.row) {
    const timeout = window.setTimeout(() => {
      store$.list.rowInFocus.set({
        row: state.value.row,
        hover: true,
        focus: false,
      });
    }, 200);

    timeout$.set(timeout);
  }
});

export const makeListProps = <T extends RecordType = RecordType>(
  options?: MakeListPropsOptions<T>
): ListProps<T & ListItem> => {
  const viewConfigManager = store$.viewConfigManager.get();
  const selected = store$.list.selected.get();

  const { list } = viewConfigManager?.viewConfig?.ui || {};
  const fieldsLeft = options?.fieldsLeft ?? list?.fieldsLeft ?? [];
  const fieldsRight = options?.fieldsRight ?? list?.fieldsRight ?? [];
  const _renderLabel = fieldsLeft.length === 0 && list?.useLabel !== false;
  const dataModel = store$.dataModel.get() as DataModelNew<T>;

  const grouping = store$.displayOptions.grouping.get();
  const groupingIsRelationalField = grouping.field?.relation;

  const sorting = store$.displayOptions.sorting.get();

  const listGrouping: ListProps['grouping'] = {
    groupByTableName: '',
    groupByField: '',
    groupLabel: '',
    groups: [],
  };

  if (groupingIsRelationalField && grouping.field?.name) {
    listGrouping.groupByTableName = grouping.field.relation?.tableName ?? '';
    listGrouping.groupByField = grouping.field?.relation?.fieldName ?? '';
    listGrouping.groupLabel =
      grouping.field?.relation?.tableName.firstUpper().slice(0, -1) ?? '';

    listGrouping.groups =
      store$.relationalDataModel[grouping.field.name]
        ?.get()
        .rows.map((row) => ({
          groupById: row.id,
          groupByLabel: row.label,
        })) ?? [];
  } else if (grouping.field?.type === 'Boolean' && grouping.field) {
    listGrouping.groupByField = grouping.field?.name ?? '';
    listGrouping.groupLabel =
      grouping.field?.name.firstUpper().slice(0, -1) ?? '';

    listGrouping.groups =
      [true, false]
        .map((value) => ({
          ...makeRowFromValue(value.toString(), grouping.field as FieldConfig),
          value,
        }))
        .map((row) => ({
          groupById: row.id,
          groupByLabel:
            row.id === 'true'
              ? grouping.field?.name.firstUpper() ?? ''
              : `Not ${grouping.field?.name.firstUpper()}`,
        })) ?? [];
  } else if (grouping.field?.enum) {
    // IMPROVEMENT: [LATER] Implement grouping by enum
    console.warn('Grouping by enum is not implemented yet');
    alert('Grouping by enum is not implemented yet');
  }

  // if we are grouped by a relation field like "projects", when sorting, we want to sort the groups
  if (sorting.field?.name === listGrouping.groupByTableName) {
    listGrouping.groups = listGrouping.groups.sort((a, b) => {
      const x = a.groupByLabel.toLowerCase();
      const y = b.groupByLabel.toLowerCase();

      return sorting.order === 'asc' ? x.localeCompare(y) : y.localeCompare(x);
    });
  }

  if (
    listGrouping.groups.length &&
    derviedDisplayOptions.showEmptyGroups.get()
  ) {
    listGrouping.groups.push({
      groupById: undefined,
      groupByLabel: `No ${listGrouping.groupLabel}`,
    });
  }

  const renderFields = (
    row: Row<T>,
    fields: (keyof T)[]
  ): ListProps['items'][0]['valuesLeft'] => {
    return (
      fields
        ?.filter((fieldName) => {
          const viewFieldDisplayOptions = store$.displayOptions.viewField.get();

          const shouldDisplay = viewFieldDisplayOptions.selected.includes(
            fieldName.toString()
          );

          return shouldDisplay;
        })
        .map((fieldName) => {
          let item;
          let label;
          let id;
          let field;

          try {
            item = row.getField(fieldName);
            label = item.label;
            id = item.id;
            field = item.field;
            field = item.field;
          } catch (error) {
            throw new Error(
              `Field ${field?.name} not found in row ${
                row.id
              } of view ${viewConfigManager.getViewName()}`
            );
          }

          return {
            id,
            label,
            relation: field.relation && {
              ...field.relation,
            },
            render: () => {
              return <ListFieldValue field={field} row={row} />;
            },
          };
        }) ?? []
    );
  };

  const renderLabel = (item: Row<T>) => {
    return [
      {
        id: item.id,
        label: item.label,
        render: () => <>{item.label}</>,
      },
    ];
  };

  const items =
    dataModel?.rows?.map((item) => {
      const rowInFocus = store$.list.rowInFocus.get();

      const isInFocus =
        item.id === (rowInFocus?.row?.id ?? dataModel.rows?.[0]?.id);

      const focusType =
        isInFocus && rowInFocus && rowInFocus.focus
          ? 'focus'
          : isInFocus
          ? 'hover'
          : 'none';

      return {
        ...item.raw,
        deleted: viewConfigManager.viewConfig.mutation?.softDeleteField
          ? item.raw[
              viewConfigManager.viewConfig.mutation.softDeleteField.toString()
            ]
          : false,
        id: item.id,
        icon: Icon,
        valuesLeft: _renderLabel
          ? renderLabel(item)
          : renderFields(item, fieldsLeft),
        valuesRight: renderFields(item, fieldsRight),
        inFocus: isInFocus,

        focusType,
        onHover: () => {
          if (hasOpenDialog$.get()) {
            return;
          }

          focusedRow$.set({ row: copyRow(item), hover: true, focus: false });
        },
      } satisfies ListItem;
    }) ?? [];

  listItems$.set(items);

  if (!store$.list.rowInFocus.get()) {
    store$.list.rowInFocus.set({
      row: dataModel.rows?.[0] ? copyRow(dataModel.rows?.[0] as Row) : null,
      hover: false,
      focus: false,
    });
  }

  return {
    onSelect: (item) => store$.selectListItem(item),
    selected,
    items,
    onReachEnd: store$.globalFetchMore,
    grouping: listGrouping,
    onContextMenu: store$.onContextMenuListItem,
    onKeyPress: (type) => {
      if (hasOpenDialog$.get()) return;

      const indexOfRowInFocus = dataModel.rows?.findIndex(
        (row) => row.id === store$.list.rowInFocus.get()?.row?.id
      );

      const newIndex =
        type === 'down'
          ? Math.min(indexOfRowInFocus + 1, dataModel.rows.length - 1)
          : Math.max(indexOfRowInFocus - 1, 0);

      const newRow = dataModel.rows[newIndex];

      newRow &&
        store$.list.rowInFocus.set({
          row: copyRow(newRow),
          hover: false,
          focus: true,
        });
    },
  };
};
