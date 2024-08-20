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
  throw new Error('Not supported yet');

  return {
    success: true,
  };
};

export const mutationHandlers: MUTATION_HANDLER_PRISMA = {
  CREATE_RECORD: createMutation,
  DELETE_RECORD: deleteMutation,
  UPDATE_RECORD: updateMutation,
};
