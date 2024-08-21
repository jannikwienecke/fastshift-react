import {
  viewLoaderHandler,
  viewMutationHandler,
} from '@apps-next/convex-adapter-app';
import * as server from './_generated/server';

export const viewLoader = server.query({
  handler: viewLoaderHandler,
});

export const viewMutation = server.mutation({
  handler: viewMutationHandler,
});

// export const deleteMutation = server.mutation({
//   handler: (ctx, args) => {
//     console.log('deleteMutation');
//     // ctx.db.patch({})
//   },
// });
