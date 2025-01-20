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

  let groups: ListProps['groups'] = [];

  if (groupingIsRelationalField && grouping.field?.name) {
    groups =
      store$.relationalDataModel[grouping.field.name]
        ?.get()
        .rows.map((row) => ({
          groupByField: grouping.field?.relation?.fieldName ?? '',
          groupById: row.id,
          groupByLabel: row.label,
        })) ?? [];
  } else if (grouping.field?.type === 'Boolean' && grouping.field) {
    groups =
      [true, false]
        .map((value) => ({
          ...makeRowFromValue(value.toString(), grouping.field as FieldConfig),
          value,
        }))
        .map((row) => ({
          groupByField: grouping.field?.name ?? '',
          groupById: row.id,
          groupByLabel: row.label,
        })) ?? [];
  }

  const renderFields = (
    row: Row<T>,
    fields: (keyof T)[]
  ): ListProps['items'][0]['valuesLeft'] => {
    return (
      fields?.map((fieldName) => {
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
          render: () => <ListFieldValue field={field} row={row} />,
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
    groups: groups ?? [],
  };
};
