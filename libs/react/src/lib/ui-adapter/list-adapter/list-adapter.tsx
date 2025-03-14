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

export const listItems$ = observable<ListProps['items']>([]);

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
    dataModel?.rows?.map((item) => ({
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
    })) ?? [];

  listItems$.set(items);

  return {
    onSelect: (item) => store$.selectListItem(item),
    selected,
    items,
    onReachEnd: store$.globalFetchMore,
    grouping: listGrouping,
    onContextMenu: store$.onContextMenuListItem,
  };
};
