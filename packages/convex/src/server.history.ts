import {
  getViewByName,
  makeData,
  HistoryType,
  Row,
  ViewConfigType,
} from '@apps-next/core';
import { createViewConfig } from '@apps-next/react';
import { asyncMap } from 'convex-helpers';
import { GenericQueryCtx } from 'convex/server';
import { HistoryIcon } from 'lucide-react';
import { DataModel, Doc, Id } from '../convex/_generated/dataModel';
import { config } from './server.config';

export type HistoryViewDataType = HistoryType &
  Doc<'history'> & { owner: Doc<'owner'> };

export const historyConfig = createViewConfig(
  'history',
  {
    icon: HistoryIcon,
    viewName: 'History',
    displayField: { field: 'entityId' },
    fields: {
      timestamp: { isDateField: true },
    },

    loader: {
      postLoaderHook: async (ctx, props, items) => {
        const convex = ctx as GenericQueryCtx<DataModel>;

        const allItems = items as Doc<'history'>[];

        let lastInsertItem: Doc<'history'> | null = null;
        const filteredItems = allItems.filter((item) => {
          const view = getViewByName(props.registeredViews, item.tableName);

          if (item.changeType !== 'update' && !view?.isManyToMany) {
            lastInsertItem = item;
            return true;
          }

          if (
            view?.isManyToMany &&
            item.entityId === lastInsertItem?.entityId
          ) {
            const secondsDiff =
              (new Date(item.timestamp).getTime() -
                new Date(lastInsertItem.timestamp).getTime()) /
              1000;

            if (Math.abs(secondsDiff) > 2) {
              return true;
            }
            return false;
          }

          return true;
        });

        const values = await asyncMap(filteredItems, async (item) => {
          const entity = await convex.db.get(item.entityId as Id<any>);

          const { newValue, oldValue } = item.change;

          const view = getViewByName(props.registeredViews, item.tableName);

          // j976ya2h0zmdmtdjvdejbaqq9x7frgrh
          const newIsId =
            typeof newValue === 'string' && newValue.length === 32;
          const oldIsId =
            typeof oldValue === 'string' && oldValue.length === 32;

          if (entity && view) {
            const field = Object.values(view.viewFields).find((field) => {
              return field.relation?.fieldName === item.change.field;
            });

            const oldRecord =
              item.change.oldValue && oldIsId
                ? await convex.db.get(item.change.oldValue)
                : null;
            const newRecord =
              item.change.newValue && newIsId
                ? await convex.db.get(item.change.newValue)
                : null;

            const viewOfChangedField = getViewByName(
              props.registeredViews,
              field?.name ?? ''
            );

            const oldRow =
              oldRecord && viewOfChangedField
                ? makeData(
                    props.registeredViews,
                    viewOfChangedField?.viewName ?? ''
                  )([
                    {
                      ...oldRecord,
                      id: oldRecord._id,
                    },
                  ]).rows?.[0]
                : null;

            const newRow =
              newRecord && viewOfChangedField
                ? makeData(
                    props.registeredViews,
                    viewOfChangedField?.viewName ?? ''
                  )([
                    {
                      ...newRecord,
                      id: newRecord._id,
                    },
                  ]).rows?.[0]
                : null;

            const row = view
              ? makeData(props.registeredViews, view?.viewName ?? '')([entity])
                  .rows?.[0]
              : null;

            const owner = (item as any).owner as Doc<'owner'>;
            const changed = getChangeValue(item, { oldRow, newRow, view });

            let newHistoryData = {
              creator: {
                id: owner._id,
                label: owner.name ?? owner.firstname,
              },
              record: {
                ...entity,
                id: entity._id,
              },
              recordLabel: row?.label ?? '',
              tableName: item.tableName,
              timestamp: item.timestamp,
              changed,
            } satisfies HistoryType;

            const parsedData = {
              ...item,
              ...newHistoryData,
            } satisfies HistoryType & Doc<'history'>;

            if (item.change.isManyToMany) {
              const isInsert = item.changeType === 'insert';
              const value = isInsert
                ? item.change.newValue
                : item.change.oldValue;

              const addedEntity = await convex.db.get(value);

              const addedRow =
                addedEntity && item.change.field
                  ? makeData(
                      props.registeredViews,
                      item.change.field
                    )([
                      {
                        ...addedEntity,
                        id: addedEntity._id,
                      },
                    ]).rows?.[0]
                  : null;

              if (!addedRow) throw new Error('No added row found');

              const changed = getChangeValue(item, { relatedRow: addedRow });

              newHistoryData = {
                ...newHistoryData,
                changed: {
                  ...changed,
                },
              };

              return {
                ...parsedData,
                ...newHistoryData,
              } satisfies HistoryType & Doc<'history'>;
            }

            return parsedData;
          }

          throw new Error('No data found');
        });

        return values;
      },
    },
  },
  config.config
);

export const getChangeValue = (
  value: Doc<'history'>,
  {
    relatedRow,
    oldRow,
    newRow,
    view,
  }: {
    relatedRow?: Row | null;
    oldRow?: Row | null;
    newRow?: Row | null;
    view?: ViewConfigType;
  }
): HistoryType['changed'] => {
  const defaultData = {
    oldValue: null,
    newValue: null,
    label: '',
    fieldName: '',
    id: '',
  } as const;

  const fieldName = value.change.field ?? '';

  if (!relatedRow && !oldRow && !newRow) {
    if (value.changeType === 'insert') {
      return {
        ...defaultData,
        type: 'created',
      };
    }

    if (value.changeType === 'update') {
      return {
        ...defaultData,
        type: 'changed',
        fieldName,
        newValue: value.change.newValue,
        oldValue: value.change.oldValue,
      };
    }
  }

  if (relatedRow) {
    if (value.changeType === 'insert') {
      return {
        ...defaultData,
        type: 'added',
        fieldName,
        label: relatedRow.label,
        id: relatedRow.id,
      };
    }

    if (value.changeType === 'delete') {
      return {
        ...defaultData,
        type: 'removed',
        fieldName,
        label: relatedRow.label,
        id: relatedRow.id,
      };
    }
  }

  if (newRow || oldRow) {
    const field = Object.values(view?.viewFields ?? {}).find((field) => {
      return field.relation?.fieldName === value.change.field;
    });

    if (value.changeType === 'update' && newRow) {
      return {
        type: 'added-to',
        fieldName: field?.name ?? '',
        label: newRow.label,
        oldValue: oldRow?.label ?? '',
        newValue: newRow.label,
        id: newRow.id,
      };
    }

    if (value.changeType === 'update' && !newRow && oldRow) {
      return {
        type: 'removed-from',
        fieldName: field?.name ?? '',
        label: oldRow.label,
        oldValue: oldRow.label,
        newValue: '',
        id: oldRow.id,
      };
    }
  }

  return {
    ...defaultData,
    type: 'created',
    fieldName: '',
  };
};
