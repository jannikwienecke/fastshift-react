import {
  handleTriggerChanges,
  makeViewLoaderHandler,
  makeViewMutationHandler,
} from '@apps-next/convex-adapter-app';
import * as server from './_generated/server';

import {
  BaseViewConfigManager,
  GetTableName,
  RecordType,
  UserViewData,
  _log,
  getViewByName,
  slugHelper,
} from '@apps-next/core';
import { asyncMap } from 'convex-helpers';
import {
  customCtx,
  customMutation,
} from 'convex-helpers/server/customFunctions';
import { Triggers } from 'convex-helpers/server/triggers';
import { v } from 'convex/values';
import { views } from '../src/index';
import { DataModel, Doc, Id } from './_generated/dataModel';
import { mutation as rawMutation } from './_generated/server';

export const triggers = new Triggers<DataModel>();

const tables: GetTableName[] = [
  'categories',
  'projects',
  'tasks',
  'todos',
  'owner',
  'views',
  'users',
  'tags',
  'tasks_tags',
];

tables.forEach((tableName) => {
  triggers.register(tableName, async (ctx, change) => {
    await handleTriggerChanges({
      change,
      ctx,
      tableName,
      views,
    });
  });
});

export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));

export const viewLoader = server.query({
  handler: makeViewLoaderHandler(views),
});

export const viewMutation = mutation({
  handler: makeViewMutationHandler(views),
});

export const getViewRelationalFilterOptions = server.query({
  args: {
    tableName: v.string(),
    withCount: v.boolean(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    [table: string]: {
      record: RecordType;
      count: number | null;
    }[];
  }> => {
    const { tableName } = args;

    // make this work based on the config
    // add no project to the tabs resullt list
    // add translations..
    const view = getViewByName(views, tableName);

    if (!view) throw new Error(`View not found for table: ${tableName}`);

    const vi = Object.entries(view?.fields ?? {})
      .filter(([, v]) => v?.useAsSidebarFilter)
      .map(
        ([k]) =>
          Object.values(view.viewFields).find(
            (v) => v.relation?.fieldName === k
          )?.name
      )
      .filter(Boolean);

    const tables = vi as GetTableName[];

    const viewConfigManager = new BaseViewConfigManager(view);

    const result = await asyncMap(tables, async (table) => {
      const allProjects = ctx.db.query(table).collect();

      const config = Object.values(view.viewFields).find(
        (f) => f.name === table
      );
      const fieldName = config?.relation?.fieldName;

      const indexFields = viewConfigManager.getIndexFields();
      const index = indexFields.find(
        (f) => f.fields?.[0].toString() === fieldName
      );

      // TODO Refactor and remove duplicated code todoId:1
      const manyToMany = Object.values(views).find(
        (v) =>
          v?.isManyToMany &&
          [tableName, table].every((t) => Object.keys(v.viewFields).includes(t))
      );

      return asyncMap(allProjects, async (record) => {
        if (!args.withCount) return { [table]: record, count: null };

        if (manyToMany) {
          const fieldName = manyToMany.viewFields[table]?.relation?.fieldName;
          const indexFields = manyToMany.query?.indexFields || [];
          const index = indexFields.find(
            (f) => f.fields?.[0].toString() === fieldName
          );

          if (!index) {
            throw new Error(
              `Index not found for table: ${table} with field: ${fieldName}`
            );
          }

          const manyToManyRecordsOf = await ctx.db
            .query(manyToMany.tableName)
            .withIndex(index?.name, (q) =>
              q.eq(index?.fields?.[0], record._id as any)
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

        if (!index) {
          throw new Error(
            `Index not found for table: ${table} with field: ${fieldName}`
          );
        }

        const recordsOf = await ctx.db
          .query(view.tableName)
          .withIndex(index.name, (q) =>
            q.eq(index.fields?.[0].toString() ?? '', record._id)
          )
          .collect();

        return {
          record: {
            id: record._id,
            ...record,
          },
          count: recordsOf.length,
        };
      });
    });

    return tables.reduce(
      (acc, table, index) => ({
        ...acc,
        [table]: result[index],
      }),
      {} satisfies Record<
        string,
        {
          record: RecordType;
          count: number | null;
        }
      >
    );
  },
});

export const testQuery = server.mutation({
  async handler(ctx, args_0) {
    try {
      // ctx.db.query('tasks').withIndex('todos', q => q.eq('todos', ))

      const res = await ctx.db.patch(
        'jh71s0zc8vdtxrtppctrjkjdg97c24qs' as Id<'tasks'>,
        {
          tasks: ['jh78cgz4xwtkxrthtm485df5f17c3999' as Id<'tasks'>],
        }
      );
    } catch (error) {
      console.error('testQuery error', { error });
    }
  },
});

export const getUserViews = server.query({
  handler: async (ctx, args): Promise<Partial<UserViewData>[]> => {
    const views = await ctx.db.query('views').collect();

    return asyncMap(views, async (view) => {
      if (!view.rowId || !view.rowLabelFieldName)
        return {
          ...view,
          id: view._id,
        };

      const row = await ctx.db.get(view.rowId as Id<any>);

      if (!row) {
        return view;
      }

      const label = row[view.rowLabelFieldName as keyof Doc<any>];

      return {
        ...view,
        id: view._id,
        name: label,
        slug: slugHelper().slugify(label as string),
      };
    });
  },
});

export const displayOptions = server.query({
  handler: async (ctx) => {
    const tasks = await ctx.db.query('tasks').collect();

    const start = new Date().getTime();
    const end = start + 1000 * 60 * 60 * 24;

    const filter = tasks.filter(
      (t) => t.dueDate && t.dueDate >= start && t.dueDate <= end
    );
  },
});

export const deleteMutesttation = server.query({
  handler: async (ctx, args) => {
    const posts = await asyncMap(
      // one-to-many
      ctx.db.query('projects').take(10),
      async (post) => {
        // one-to-many

        const category = await ctx.db
          .query('categories')
          .withIndex('by_id', (q) => q.eq('_id', post.categoryId))
          .first();

        const author = await ctx.db
          .query('owner')
          .withIndex('by_id', (q) => q.eq('_id', post.ownerId))
          .first();

        return { ...post, category, author };
      }
    );

    return {};
  },
});
