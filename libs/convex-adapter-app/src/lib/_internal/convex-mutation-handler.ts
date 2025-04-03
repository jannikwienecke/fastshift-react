import {
  ERROR_STATUS,
  FieldConfig,
  MutationHandlerReturnType,
  MutationPropsServer,
} from '@apps-next/core';
import { deleteIds, insertIds } from './convex-mutation-helper';
import { ConvexContext } from './convex.db.type';
import { GenericMutationCtx } from './convex.server.types';
import { ID } from './types.convex';
import { MUTATION_HANDLER_CONVEX } from './types.convex.mutation';
import { getErrorMessage } from './convex-utils';

export const createMutation = async (
  ctx: GenericMutationCtx,
  props: MutationPropsServer
) => {
  const { mutation, viewConfigManager } = props;
  if (mutation.type !== 'CREATE_RECORD') throw new Error('INVALID MUTATION-1');

  let { record } = mutation.payload;
  const displayField = viewConfigManager.getDisplayFieldLabel();
  const displayValue = record?.[displayField];

  const manyToManyFields: FieldConfig[] = [];
  Object.entries(record).forEach(([fieldName, value]) => {
    const field = viewConfigManager.getFieldByRelationFieldName(fieldName);
    if (field && field.relation?.manyToManyTable) {
      manyToManyFields.push(field);
    }
  });

  const beforeInsert = viewConfigManager.viewConfig.mutation?.beforeInsert;

  if (beforeInsert) {
    record = beforeInsert(record);
  }

  try {
    const res = await ctx.db.insert(viewConfigManager.getTableName(), record);

    for (const index in manyToManyFields) {
      const field = manyToManyFields[index];
      if (!field?.relation?.fieldName) continue;

      const ids = record[field?.relation?.fieldName];

      await selectRecordsMutation(ctx, {
        ...props,
        mutation: {
          type: 'SELECT_RECORDS',
          payload: { newIds: ids, idsToDelete: [], table: field.name, id: res },
        },
      });
    }

    return {
      message: `Record ID="${res}" (${displayValue}) created successfully`,
      status: 201 as const,
    };
  } catch (error) {
    return {
      status: ERROR_STATUS.INTERNAL_SERVER_ERROR,
      message: `Error creating record. Record=${JSON.stringify(
        record
      )} displayField=${displayField} displayValue=${displayValue}`,
      error: getErrorMessage(error),
    };
  }
};

export const deleteMutation = async (
  ctx: ConvexContext,
  { mutation, viewConfigManager }: MutationPropsServer
): Promise<MutationHandlerReturnType> => {
  if (mutation.type !== 'DELETE_RECORD') throw new Error('INVALID MUTATION-2');

  const { id } = mutation.payload;

  const { softDeleteField } = viewConfigManager.viewConfig.mutation ?? {};

  let mutationFn: () => Promise<unknown>;
  let errorMsg = '';
  if (softDeleteField) {
    errorMsg = `Error soft deleting record. softDeleteField=${softDeleteField.toString()} ID="${id}:`;
    mutationFn = () =>
      ctx.db.patch(mutation.payload.id, {
        [softDeleteField]: true,
      });
  } else {
    errorMsg = `Error deleting record. ID="${id}:`;
    mutationFn = () => ctx.db.delete(id);
  }

  try {
    await mutationFn();
  } catch (error) {
    return {
      status: ERROR_STATUS.INTERNAL_SERVER_ERROR,
      message: errorMsg,
      error: getErrorMessage(error),
    };
  }

  return {
    message: `Record ${id} deleted successfully`,
    status: 200 as const,
  };
};

export const updateMutation = async (
  ctx: GenericMutationCtx,
  props: MutationPropsServer
) => {
  const { mutation, viewConfigManager } = props;

  if (mutation.type !== 'UPDATE_RECORD') throw new Error('INVALID MUTATION-3');

  const record = Object.entries(mutation.payload.record).reduce(
    (acc, [key, value]) => {
      if (
        // only for testing purpose
        key === 'name' &&
        viewConfigManager.viewConfig.tableName === 'tasks' &&
        value === '_error_'
      ) {
        acc[key] = undefined;
      } else if (value === null) {
        acc[key] = undefined;
      } else {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, unknown>
  );

  try {
    await ctx.db.patch(mutation.payload.id, record);
    return {
      message: 'Record updated successfully',
      status: 200 as const,
    };
  } catch (error) {
    const displayField = viewConfigManager.getDisplayFieldLabel();
    const displayValue = record?.[displayField];
    return {
      status: ERROR_STATUS.INTERNAL_SERVER_ERROR,
      message: `Error updating record. Record ID=${mutation.payload.id} displayField=${displayField} displayValue=${displayValue}`,
      error: getErrorMessage(error),
    };
  }
};

export const selectRecordsMutation = async (
  ctx: GenericMutationCtx,
  props: MutationPropsServer
) => {
  const { mutation, viewConfigManager } = props;

  if (mutation.type !== 'SELECT_RECORDS') throw new Error('INVALID MUTATION-4');

  const { idsToDelete, newIds, table } = mutation.payload;

  const field = viewConfigManager.getFieldBy(table);

  try {
    await insertIds(newIds as ID[], props, ctx, field);
    await deleteIds(idsToDelete as ID[], props, ctx, field);
  } catch (error) {
    return {
      status: ERROR_STATUS.INTERNAL_SERVER_ERROR,
      message: `Error deleting or inserting records. newIDs=${idsToDelete} deleteIDs=${newIds}`,
      error: getErrorMessage(error),
    };
  }

  return {
    message: `Records with IDs=${idsToDelete} deleted and IDs=${newIds} inserted successfully`,
    status: 200 as const,
  };
};

export const mutationHandlers: MUTATION_HANDLER_CONVEX = {
  CREATE_RECORD: createMutation,
  DELETE_RECORD: deleteMutation,
  UPDATE_RECORD: updateMutation,
  SELECT_RECORDS: selectRecordsMutation,
};
