import { MutationPropsServer } from '@apps-next/core';
import { MUTATION_HANDLER_CONVEX } from './types.convex.mutation';

// TODO CLEAN UP
export const createMutation = async (
  ctx: any,
  { mutation, viewConfigManager }: MutationPropsServer
) => {
  if (mutation.type !== 'CREATE_RECORD') throw new Error('Not supported yet');

  const { record } = mutation;
  await ctx.db.insert(viewConfigManager.getTableName(), record);

  return {
    success: true,
  };
};

export const deleteMutation = async (
  ctx: any,
  { mutation, viewConfigManager }: MutationPropsServer
) => {
  throw new Error('Not supported yet');

  return {
    success: true,
  };
};

export const updateMutation = async (
  ctx: any,
  { mutation, viewConfigManager }: MutationPropsServer
) => {
  throw new Error('Not supported yet');

  return {
    success: true,
  };
};

export const mutationHandlers: MUTATION_HANDLER_CONVEX = {
  CREATE_RECORD: createMutation,
  DELETE_RECORD: deleteMutation,
  UPDATE_RECORD: updateMutation,
};
