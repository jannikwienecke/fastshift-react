import { viewLoaderHandler } from '@apps-next/convex-adapter-app';
import * as server from './_generated/server';

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
