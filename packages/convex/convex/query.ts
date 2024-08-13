import * as server from './_generated/server';
import { viewLoaderHandler } from '@apps-next/convex-adapter';

export const viewLoader = server.query({
  handler: viewLoaderHandler,
});

// export const testHandler = server.query({
//   handler: async (ctx, args) => {
//     console.log('testHandler', { args });
//     return await ctx.db
//       .query('tasks')
//       .filter((q) =>
//         q.or(
//           args.query === ''
//             ? q.not(q.eq(q.field('name'), ''))
//             : q.eq(q.field('name'), args?.query as string)
//         )
//       );
//   },
// });
