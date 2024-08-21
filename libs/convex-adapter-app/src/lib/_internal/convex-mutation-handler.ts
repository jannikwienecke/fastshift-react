import { MutationPropsServer } from '@apps-next/core';
import { MUTATION_HANDLER_CONVEX } from './types.convex.mutation';

// TODO CLEAN UP
export const createMutation = async (
  ctx: any,
  { mutation, viewConfigManager }: MutationPropsServer
) => {
  if (mutation.type !== 'CREATE_RECORD') throw new Error('INVALID MUTATION-1');

  const { record } = mutation;
  console.warn('createMutation', { record });

  await ctx.db.insert(viewConfigManager.getTableName(), record);

  return {
    success: true,
  };
};

export const deleteMutation = async (
  ctx: any,
  { mutation, viewConfigManager }: MutationPropsServer
) => {
  if (mutation.type !== 'DELETE_RECORD') throw new Error('INVALID MUTATION-2');

  const { id } = mutation;

  console.warn('deleteMutation', { id });
  await ctx.db.delete(id);

  return {
    success: true,
  };
};

export const updateMutation = async (
  ctx: any,
  { mutation, viewConfigManager }: MutationPropsServer
) => {
  if (mutation.type !== 'UPDATE_RECORD') throw new Error('INVALID MUTATION-3');

  await ctx.db.patch(mutation.id, mutation.record);

  return {
    success: true,
  };
};

export const mutationHandlers: MUTATION_HANDLER_CONVEX = {
  CREATE_RECORD: createMutation,
  DELETE_RECORD: deleteMutation,
  UPDATE_RECORD: updateMutation,
};
