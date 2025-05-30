import {
  handleTriggerChanges,
  makeViewLoaderHandler,
  makeViewMutationHandler,
  relationalFilterQuery,
} from '@apps-next/convex-adapter-app';
import * as server from './_generated/server';

import {
  BaseViewConfigManager,
  GetTableName,
  IndexField,
  RecordType,
  RelationalFilterQueryDto,
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
    ids: v.optional(v.array(v.string())),
  },
  handler: relationalFilterQuery(views),
});

export const globalQuery = server.query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.query.length < 3) {
      return [];
    }

    const allViews = Object.entries(views);
    const resultsPromises = allViews.map(async ([viewName, view]) => {
      if (!view) return null;
      const searchableFields = new BaseViewConfigManager(
        view
      ).getSearchableFields();

      const promises =
        searchableFields?.map(async (field) => {
          return await ctx.db
            .query(view.tableName)
            .withSearchIndex(field.name, (q) =>
              q.search(field.field.toString(), args.query)
            )
            .collect();
        }) ?? [];

      const responses = await Promise.all(promises);
      const ids = responses.flatMap((r) => r.map((d) => d._id));
      const uniqueIds = [...new Set(ids)];
      return uniqueIds.map((id) => {
        const record = responses.flatMap((r) => r).find((d) => d._id === id);
        return record;
      });
    });

    const results = await Promise.all(resultsPromises);

    const dict = allViews.reduce((acc, [viewName], index) => {
      const records = results[index];
      if (!records || records.length === 0) return acc;

      return {
        ...acc,
        [viewName]: records.map((record) => {
          return {
            ...record,
            id: record._id,
          };
        }),
      };
    }, {} as Record<string, Doc<any>[] | null>);

    return dict;
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

export const getLastEditedTask = server.query({
  handler: async (ctx) => {
    // Find the most recent update to a task in the history table
    const lastEdit = await ctx.db
      .query('history')
      .withIndex('by_table', (q) => q.eq('tableName', 'tasks'))
      .order('desc')
      .take(1);
    if (lastEdit.length === 0) return null;
    // Get the corresponding task document
    const taskId = lastEdit[0].entityId as Id<'tasks'>;
    const task = await ctx.db.get(taskId);
    return { lastEdit: lastEdit[0], task };
  },
});
