import {
  makeViewLoaderHandler,
  makeViewMutationHandler,
} from '@apps-next/convex-adapter-app';
import * as server from './_generated/server';

import { asyncMap } from 'convex-helpers';
import { views } from '../src/index';

export const viewLoader = server.query({
  handler: makeViewLoaderHandler(views),
});

export const viewMutation = server.mutation({
  handler: makeViewMutationHandler(views),
});

export const deleteMutation = server.mutation({
  handler: async (ctx, args) => {
    // ctx.db.patch('' as Id<'tasks'>, {projectId: '123'})

    console.log('deleteMutation');

    const projectIds = ['123', '456'];

    const tasks = await ctx.db
      .query('tasks')
      .filter((q) =>
        q.or(
          ...projectIds.map((projectId) =>
            q.eq(q.field('projectId'), projectId)
          )
        )
      )
      .collect();

    // const tasks = await ctx.db
    //   .query('tasks')
    //   .filter((q) => q.field('projectId').oneOf(projectIds))
    //   .collect();
  },
});

export const deleteMutesttation = server.query({
  handler: async (ctx, args) => {
    console.log('deleteMutation');
    // ctx.db.
    // ctx.db
    //   .query('tags')
    //   .

    // ctx.db.query("categories").

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

    // const res = ctx.db.query('projects').take();
    // ctx.db.query('ca')
    return {};
  },
});
