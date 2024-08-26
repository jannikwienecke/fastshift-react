import {
  Mutation,
  CREATE_RECORD,
  UPDATE_RECORD,
  DELETE_RECORD,
  SUCCESS_STATUS,
  MutationReturnDtoSuccess,
} from '@apps-next/core';
import { MUTATION_HANDLER_PRISMA } from './prisma-mutation.types';
import {
  createMutation,
  deleteMutation,
  updateMutation,
} from './prisma-mutations-handler';

export const mutationHandlers: MUTATION_HANDLER_PRISMA = {
  CREATE_RECORD: createMutation,
  DELETE_RECORD: deleteMutation,
  UPDATE_RECORD: updateMutation,
};

export function isCreateRecord(mutation: Mutation): mutation is CREATE_RECORD {
  return mutation.type === 'CREATE_RECORD';
}

export function isUpdateRecord(mutation: Mutation): mutation is UPDATE_RECORD {
  return mutation.type === 'UPDATE_RECORD';
}

export function isDeleteRecord(mutation: Mutation): mutation is DELETE_RECORD {
  return mutation.type === 'DELETE_RECORD';
}

export function throwInvalidMutationTypeError(mutation: Mutation): never {
  throw new Error(`Invalid mutation type: ${mutation.type}`);
}

export const createSuccessResponse = <T extends keyof typeof SUCCESS_STATUS>(
  message: string,
  status: T
): MutationReturnDtoSuccess => {
  return {
    success: {
      message,
      status: SUCCESS_STATUS[status] as (typeof SUCCESS_STATUS)[T],
    },
  };
};
