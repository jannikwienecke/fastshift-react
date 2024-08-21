import { MutationPropsServer } from '@apps-next/core';
import { DbMutation } from '../prisma.types';
import { MUTATION_HANDLER_PRISMA } from './prisma-mutation.types';

// TODO CLEAN UP
export const createMutation = async (
  dbMutation: DbMutation,
  { mutation, viewConfigManager }: MutationPropsServer
) => {
  if (mutation.type !== 'CREATE_RECORD') throw new Error('Not supported yet');

  const { record } = mutation;

  await dbMutation.create({
    data: record,
  });

  return {
    success: true,
  };
};

export const deleteMutation = async (
  dbMutation: DbMutation,
  { mutation, viewConfigManager }: MutationPropsServer
) => {
  if (mutation.type !== 'DELETE_RECORD') throw new Error('Not supported yet');

  const { id } = mutation;

  await dbMutation.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
  };
};

export const updateMutation = async (
  dbMutation: DbMutation,
  { mutation, viewConfigManager }: MutationPropsServer
) => {
  if (mutation.type !== 'UPDATE_RECORD') throw new Error('Not supported yet');

  const { id } = mutation;
  const { id: _, ...data } = mutation.record;

  console.warn('updateMutation', { id, data });

  const waitFor1 = () => new Promise((resolve) => setTimeout(resolve, 1000));
  await waitFor1();

  await dbMutation.update({
    where: {
      id,
    },
    data: data,
  });

  return {
    success: true,
  };
};

export const mutationHandlers: MUTATION_HANDLER_PRISMA = {
  CREATE_RECORD: createMutation,
  DELETE_RECORD: deleteMutation,
  UPDATE_RECORD: updateMutation,
};
