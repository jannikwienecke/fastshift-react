import { MutationPropsServer } from '@apps-next/core';
import { deleteIds, insertIds } from './convex-mutation-helper';
import { ConvexContext } from './convex.db.type';
import { GenericMutationCtx } from './convex.server.types';
import { ID } from './types.convex';
import { MUTATION_HANDLER_CONVEX } from './types.convex.mutation';

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
  ctx: GenericMutationCtx,
  props: MutationPropsServer
) => {
  const { mutation } = props;

  if (mutation.type !== 'UPDATE_RECORD') throw new Error('INVALID MUTATION-3');

  console.log('updateMutation', mutation.payload);

  const record = Object.entries(mutation.payload.record).reduce(
    (acc, [key, value]) => {
      if (value === null) {
        acc[key] = undefined;
      } else {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>
  );

  await ctx.db.patch(mutation.payload.id, record);

  return {
    message: '200',
    status: 200 as const,
  };
};

export const selectRecordsMutation = async (
  ctx: GenericMutationCtx,
  props: MutationPropsServer
) => {
  const { mutation, viewConfigManager } = props;

  if (mutation.type !== 'SELECT_RECORDS') throw new Error('INVALID MUTATION-4');

  console.log('selectRecordsMutation', mutation.payload);

  const { idsToDelete, newIds, table } = mutation.payload;

  const field = viewConfigManager.getFieldBy(table);

  const promiseDeleteIds = deleteIds(idsToDelete as ID[], props, ctx, field);
  const promiseInsertIds = insertIds(newIds as ID[], props, ctx, field);

  await Promise.all([promiseDeleteIds, promiseInsertIds]);

  return {
    message: '200',
    status: 200 as const,
  };
};

export const mutationHandlers: MUTATION_HANDLER_CONVEX = {
  CREATE_RECORD: createMutation,
  DELETE_RECORD: deleteMutation,
  UPDATE_RECORD: updateMutation,
  SELECT_RECORDS: selectRecordsMutation,
};
