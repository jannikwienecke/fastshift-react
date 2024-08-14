import {
  ConvexViewConfigManager,
  viewLoaderHandler,
} from '@apps-next/convex-adapter-app';
import { Mutation, MutationProps } from '@apps-next/core';
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

// export const viewMutation = server.mutation({
//   handler: viewMutationHandler,
// });

// TODO CLEAN UP
type MUTATION_HANDLER = {
  [key in Mutation['type']]: (ctx: any, args: MutationProps) => Promise<any>;
};

export const viewMutation = server.mutation({
  handler: async (ctx, _args) => {
    const args = _args as MutationProps;

    console.log(_args);

    const { mutation, viewConfig }: MutationProps = {
      ...args,
      viewConfig: new ConvexViewConfigManager(args.viewConfig as any),
    };

    const handler = mutationHandlers[mutation.type];

    await handler(ctx, {
      mutation,
      viewConfig,
    });
  },
});

// TODO CLEAN UP
export const createMutation = async (
  ctx: any,
  { mutation, viewConfig }: MutationProps
) => {
  if (mutation.type !== 'CREATE_RECORD') return;

  const { record } = mutation;
  await ctx.db.insert(viewConfig.getTableName(), record);
};

const mutationHandlers: MUTATION_HANDLER = {
  CREATE_RECORD: createMutation,
  DELETE_RECORD: () => Promise.resolve(),
  UPDATE_RECORD: () => Promise.resolve(),
};
