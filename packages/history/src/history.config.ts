import {
  DataType,
  getViewByName,
  HistoryType,
  makeData,
} from '@apps-next/core';
import { _createViewConfig } from '@apps-next/react';
import { asyncMap } from 'convex-helpers';
import { GenericQueryCtx } from 'convex/server';
import { HistoryIcon } from 'lucide-react';
import { getChangeValue } from './history.helper';

export const historyConfig = _createViewConfig('history', {
  icon: HistoryIcon,
  displayField: { field: 'entityId' },
  fields: {
    timestamp: { isDateField: true },
  },

  loader: {
    postLoaderHook: async (ctx, props, items) => {
      const convex = ctx as GenericQueryCtx<any>;

      const allItems = items as DataType<'history'>[];

      let lastInsertItem: DataType<'history'> | null = null;
      const filteredItems = allItems.filter((item) => {
        const view = getViewByName(props.registeredViews, item.tableName);

        if (item.changeType !== 'update' && !view?.isManyToMany) {
          lastInsertItem = item;
          return true;
        }

        if (view?.isManyToMany && item.entityId === lastInsertItem?.entityId) {
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
        const entity = await convex.db.get(item.entityId as any);

        const { newValue, oldValue } = item.change;

        const view = getViewByName(props.registeredViews, item.tableName);

        // j976ya2h0zmdmtdjvdejbaqq9x7frgrh
        const newIsId = typeof newValue === 'string' && newValue.length === 32;
        const oldIsId = typeof oldValue === 'string' && oldValue.length === 32;

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

          const owner = (item as any).owner as DataType<'owner'>;
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
          } satisfies HistoryType & DataType<'history'>;

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
            } satisfies HistoryType & DataType<'history'>;
          }

          return parsedData;
        }

        throw new Error('No data found');
      });

      return values;
    },
  },
});
