import { viewLoaderHandler } from '@apps-next/convex-adapter-app';
import * as server from './_generated/server';
import { v } from 'convex/values';

export const viewLoader = server.query({
  handler: viewLoaderHandler,
  // handler: async (ctx, args) => {
  //   console.log('viewLoaderHandler', { args });
  //   return await ctx.db
  //     .query('tasks')

  //     .collect();
  // },
});

// export const testHandler = server.query({
//   handler: async (ctx, args) => {
//     console.log('testHandler', { args });

//     // .filter((q) =>
//     //   q.or(
//     //     args.query === ''
//     //       ? q.not(q.eq(q.field('name'), ''))
//     //       : q.eq(q.field('name'), args?.query as string)
//     //   )
//     // );
//   },
// });

export const mutation = server.mutation({
  args: {
    name: v.string(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    console.log('actionHandler', { args });

    await ctx.db.insert('tasks', {
      completed: args.completed,
      name: args.name,
    });
  },
});
