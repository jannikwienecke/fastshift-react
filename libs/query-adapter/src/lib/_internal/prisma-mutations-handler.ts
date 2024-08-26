import { MutationPropsServer } from '@apps-next/core';
import { DbMutation } from '../prisma.types';
import {
  createSuccessResponse,
  isCreateRecord,
  isDeleteRecord,
  isUpdateRecord,
  throwInvalidMutationTypeError,
} from './prisma-mutations-helper';

export const createMutation = async (
  dbMutation: DbMutation,
  { mutation }: MutationPropsServer
) => {
  if (!isCreateRecord(mutation)) throwInvalidMutationTypeError(mutation);

  const { record } = mutation.payload;

  const result = await dbMutation.create({
    data: record,
  });

  return createSuccessResponse(
    `Record ${result?.id} created successfully`,
    'CREATED'
  );
};

export const deleteMutation = async (
  dbMutation: DbMutation,
  { mutation }: MutationPropsServer
) => {
  if (!isDeleteRecord(mutation)) throwInvalidMutationTypeError(mutation);

  const { id } = mutation.payload;

  await dbMutation.delete({
    where: {
      id,
    },
  });

  return createSuccessResponse(`Record ${id} deleted successfully`, 'DELETED');
};

export const updateMutation = async (
  dbMutation: DbMutation,
  { mutation, viewConfigManager }: MutationPropsServer
) => {
  if (!isUpdateRecord(mutation)) throwInvalidMutationTypeError(mutation);

  const { id } = mutation.payload;
  const { id: _, ...data } = mutation.payload.record;

  await dbMutation.update({
    where: {
      id,
    },
    data: data,
  });

  return createSuccessResponse(`Record ${id} updated successfully`, 'UPDATED');
};
