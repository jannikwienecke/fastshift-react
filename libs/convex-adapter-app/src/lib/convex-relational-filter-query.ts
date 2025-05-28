import {
  BaseViewConfigManager,
  GetTableName,
  getViewByName,
  RegisteredViews,
  RelationalFilterQueryDto,
  RelationalFilterQueryProps,
} from '@apps-next/core';
import { GenericQueryCtx, Id } from './_internal/convex.server.types';
import { asyncMap } from 'convex-helpers';
import { ConvexRecord } from './_internal/types.convex';
import { queryClient } from './_internal/convex-client';

export const relationalFilterQuery =
  (views: RegisteredViews) =>
  async (ctx: GenericQueryCtx, args: RelationalFilterQueryProps) => {
    const { tableName, ids } = args;

    const view = getViewByName(views, tableName);

    if (!view) throw new Error(`View not found for table: ${tableName}`);

    const tables = Object.values(view?.viewFields ?? {})
      .filter((f) => f.useAsSidebarFilter)
      .map((f) => f.name) as GetTableName[];

    if (!ids || ids.length === 0)
      return tables.reduce(
        (acc, table) => ({
          ...acc,
          [table]: [{ record: null, count: 0 }],
        }),
        {} satisfies RelationalFilterQueryDto
      );

    const viewConfigManager = new BaseViewConfigManager(view);

    const dictIdsOfUndefined: {
      [table: string]: string[];
    } = {};

    const result = await asyncMap(tables as string[], async (table) => {
      const allProjects = (await ctx.db
        .query(table)
        .collect()) as ConvexRecord[];

      const config = Object.values(view.viewFields).find(
        (f) => f.name === table
      );
      const fieldName = config?.relation?.fieldName;

      const indexFields = viewConfigManager.getIndexFields();
      let index = indexFields.find(
        (f) => f.fields?.[0].toString() === fieldName
      );

      // TODO Refactor and remove duplicated code todoId:1
      const manyToMany = Object.values(views).find(
        (v) =>
          v?.isManyToMany &&
          [tableName, table].every((t) => Object.keys(v.viewFields).includes(t))
      );

      if (manyToMany) {
        const fieldName = manyToMany.viewFields[table]?.relation?.fieldName;
        const indexFields = manyToMany.query?.indexFields || [];
        index = indexFields.find((f) => f.fields?.[0].toString() === fieldName);
      }

      if (!index) {
        throw new Error(
          `Index not found for table: ${table} with field: ${fieldName}`
        );
      }

      if (!manyToMany) {
        const viewTableQuery = queryClient(ctx, view.tableName);

        let recordsOfUndefined = await viewTableQuery
          .withIndex(index.name, (q) =>
            q.eq(index.fields?.[0].toString() ?? '', undefined)
          )
          .collect();

        recordsOfUndefined = recordsOfUndefined.filter((record) => {
          return ids?.includes(record._id as string);
        });

        if (recordsOfUndefined.length > 0) {
          dictIdsOfUndefined[table] = recordsOfUndefined.map(
            (r) => r._id as string
          );
        }
      } else {
        asyncMap(ids, async (id) => {
          const manyToManyQuery = queryClient(ctx, manyToMany.tableName);
          const manyToManyRecordsOfNone = await manyToManyQuery
            .withIndex('taskId', (q) => q.eq('taskId', id as Id<string>))
            .collect();

          if (manyToManyRecordsOfNone.length === 0) {
            dictIdsOfUndefined[table] = [
              ...(dictIdsOfUndefined[table] || []),
              id,
            ];
          }
        });
      }

      return asyncMap(allProjects, async (record) => {
        if (!args.withCount) return { [table]: record, count: null };

        if (manyToMany && index) {
          const manyToManyQuery = queryClient(ctx, manyToMany.tableName);
          const manyToManyRecordsOf = await manyToManyQuery
            .withIndex(index?.name, (q) =>
              q.eq(index?.fields?.[0], record._id as Id<string>)
            )
            .collect();

          return {
            record: {
              id: record._id,
              ...record,
            },
            count: manyToManyRecordsOf.length,
          };
        }

        const viewTableQuery = queryClient(ctx, view.tableName);

        let recordsOf = await viewTableQuery
          .withIndex(index.name, (q) =>
            q.eq(index.fields?.[0].toString() ?? '', record._id)
          )
          .collect();

        recordsOf = recordsOf.filter((record) => {
          return ids?.includes(record._id as string);
        });

        return {
          record: {
            id: record._id,
            ...record,
          },
          count: recordsOf.length,
        };
      });
    });

    return tables.reduce((acc, table, index) => {
      const recordsUndefined = dictIdsOfUndefined[table.toString()] || [];

      return {
        ...acc,
        [table]: [
          { record: null, count: recordsUndefined.length },
          ...result[index],
        ],
      };
    }, {} satisfies RelationalFilterQueryDto);
  };
