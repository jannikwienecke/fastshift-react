import { getViewByName, makeData } from '@apps-next/core';
import { createViewConfig } from '@apps-next/react';
import { asyncMap } from 'convex-helpers';
import { GenericQueryCtx } from 'convex/server';
import { HistoryIcon } from 'lucide-react';
import { DataModel, Doc } from '../convex/_generated/dataModel';
import { config } from './server.config';

export const historyConfig = createViewConfig(
  'history',
  {
    icon: HistoryIcon,
    viewName: 'History',
    displayField: { field: 'entityId' },
    fields: {
      userId: {},
    },
    loader: {
      postLoaderHook: async (ctx, props, items) => {
        const convex = ctx as GenericQueryCtx<DataModel>;

        const allItems = items as Doc<'history'>[];

        const filteredItems = allItems.filter((item) => {
          const view = getViewByName(props.registeredViews, item.tableName);
          if (view?.isManyToMany) {
            return false;
          }
          return true;
        });

        return await asyncMap(filteredItems, async (item) => {
          const entity = await convex.db.get(item.entityId);

          const owner = await convex.db
            .query('owner')
            .withIndex('userId', (q) => q.eq('userId', item.userId))
            .first();

          if (!owner) {
            throw new Error('postLoaderHook: No owner found');
          }

          const view = getViewByName(props.registeredViews, item.tableName);

          const { newValue, oldValue } = item.change;

          // j976ya2h0zmdmtdjvdejbaqq9x7frgrh
          const newIsId =
            typeof newValue === 'string' && newValue.length === 32;
          const oldIsId =
            typeof oldValue === 'string' && oldValue.length === 32;

          if (entity && view) {
            const field = Object.values(view.viewFields).find(
              (field) => field.relation?.fieldName === item.change.field
            );

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
                  )([oldRecord]).rows?.[0]
                : null;

            const newRow =
              newRecord && viewOfChangedField
                ? makeData(
                    props.registeredViews,
                    viewOfChangedField?.viewName ?? ''
                  )([newRecord]).rows?.[0]
                : null;

            const row = view
              ? makeData(props.registeredViews, view?.viewName ?? '')([entity])
                  .rows?.[0]
              : null;

            return {
              ...item,
              owner,
              entity: entity,
              record: row?.raw,
              label: row?.label,
              parsedChange: {
                modelLabel: viewOfChangedField?.viewName,
                oldRecord: oldRow?.raw,
                newRecord: newRow?.raw,
                oldLabel: oldRow?.label,
                newLabel: newRow?.label,
              },
            };
          }

          throw new Error('No data found');
        });
      },
    },
  },
  config.config
);
