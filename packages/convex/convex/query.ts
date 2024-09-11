import {
  viewMutationHandler,
  makeViewLoaderHandler,
} from '@apps-next/convex-adapter-app';
import * as server from './_generated/server';

import { asyncMap } from 'convex-helpers';
import { views } from '../src/index';
import { Id } from './_generated/dataModel';

export const viewLoader = server.query({
  handler: makeViewLoaderHandler(views),
});

export const viewMutation = server.mutation({
  handler: (ctx, args) => {
    console.log('viewMutation');
    return viewMutationHandler(ctx, args);
  },
});

export const deleteMutation = server.mutation({
  handler: (ctx, args) => {
    // ctx.db.patch('' as Id<'tasks'>, {projectId: '123'})

    console.log('deleteMutation');
    return {};
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
