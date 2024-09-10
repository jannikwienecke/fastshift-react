import {
  createViewLoaderHandler,
  viewMutationHandler,
} from '@apps-next/convex-adapter-app';
import * as server from './_generated/server';

import { asyncMap } from 'convex-helpers';
import { views } from '../src/index';

export const viewLoader = server.query({
  handler: createViewLoaderHandler(views),
});

export const viewMutation = server.mutation({
  handler: (ctx, args) => {
    console.log('viewMutation');
    return viewMutationHandler(ctx, args);
  },
});

export const deleteMutation = server.mutation({
  handler: (ctx, args) => {
    console.log('deleteMutation');
    return {};
  },
});

export const deleteMutesttation = server.query({
  handler: async (ctx, args) => {
    console.log('deleteMutation');

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
