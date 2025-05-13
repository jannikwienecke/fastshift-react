import {
  handleTriggerChanges,
  makeViewLoaderHandler,
  makeViewMutationHandler,
} from '@apps-next/convex-adapter-app';
import * as server from './_generated/server';

import { GetTableName, UserViewData, _log, slugHelper } from '@apps-next/core';
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

export const userViewData = server.query({
  args: { viewName: v.union(v.string(), v.null()) },

  handler: async (ctx, args) => {
    if (!args.viewName) return null;

    const viewName = args.viewName as string;
    const view = await ctx.db
      .query('views')
      .withIndex('name', (q) => q.eq('name', viewName.toLowerCase()))
      .first();

    _log.debug('userViewData', { view });

    if (!view) return null;

    return {
      ...view,
      id: view._id,
      name: view.name,
      description: view.description ?? '',
      displayOptions: view.displayOptions ?? '',
      filters: view.filters ?? '',
    } satisfies UserViewData;
  },
});

export const displayOptions = server.query({
  handler: async (ctx) => {
    const all = await ctx.db.query('tasks').withIndex('priority').collect();

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
