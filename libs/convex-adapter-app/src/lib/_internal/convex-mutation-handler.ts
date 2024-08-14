import { MutationProps } from '@apps-next/core';
import { MUTATION_HANDLER_CONVEX } from './types.convex.mutation';

// TODO CLEAN UP
export const createMutation = async (
  ctx: any,
  { mutation, viewConfig }: MutationProps
) => {
  if (mutation.type !== 'CREATE_RECORD') return;

  const { record } = mutation;
  await ctx.db.insert(viewConfig.getTableName(), record);
};

export const mutationHandlers: MUTATION_HANDLER_CONVEX = {
  CREATE_RECORD: createMutation,
  DELETE_RECORD: () => Promise.resolve(),
  UPDATE_RECORD: () => Promise.resolve(),
};
