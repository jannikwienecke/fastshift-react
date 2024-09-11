import { MutationPropsServer } from '@apps-next/core';
import { MUTATION_HANDLER_CONVEX } from './types.convex.mutation';
import { ConvexContext } from './convex.db.type';

export const createMutation = async (
  ctx: ConvexContext,
  { mutation, viewConfigManager }: MutationPropsServer
) => {
  if (mutation.type !== 'CREATE_RECORD') throw new Error('INVALID MUTATION-1');

  const { record } = mutation.payload;

  await ctx.db.insert(viewConfigManager.getTableName(), record);

  return {
    message: '200',
    status: 200 as const,
  };
};

export const deleteMutation = async (
  ctx: ConvexContext,
  { mutation }: MutationPropsServer
) => {
  if (mutation.type !== 'DELETE_RECORD') throw new Error('INVALID MUTATION-2');

  const { id } = mutation.payload;

  await ctx.db.delete(id);

  return {
    // TODO: FIX THIS
    message: '200',
    status: 200 as const,
  };
};

export const updateMutation = async (
  ctx: ConvexContext,
  { mutation }: MutationPropsServer
) => {
  if (mutation.type !== 'UPDATE_RECORD') throw new Error('INVALID MUTATION-3');

  console.log('updateMutation', mutation);

  await ctx.db.patch(mutation.payload.id, mutation.payload.record);

  return {
    message: '200',
    status: 200 as const,
  };
};

export const mutationHandlers: MUTATION_HANDLER_CONVEX = {
  CREATE_RECORD: createMutation,
  DELETE_RECORD: deleteMutation,
  UPDATE_RECORD: updateMutation,
};
