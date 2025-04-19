import {
  ERROR_STATUS,
  FieldConfig,
  MutationHandlerReturnType,
  MutationPropsServer,
  slugHelper,
} from '@apps-next/core';
import { mutationClient, queryClient } from './convex-client';
import { mapWithInclude } from './convex-map-with-include';
import { deleteIds, insertIds } from './convex-mutation-helper';
import { getErrorMessage } from './convex-utils';
import { ConvexContext } from './convex.db.type';
import { GenericMutationCtx } from './convex.server.types';
import { ConvexRecord, ID } from './types.convex';
import { MUTATION_HANDLER_CONVEX } from './types.convex.mutation';

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
    const errors = viewConfigManager.validateRecord(record);
    if (errors) {
      return {
        status: ERROR_STATUS.INVALID_RECORD,
        // status:
        message: `Error creating record. Record=${JSON.stringify(
          record
        )} displayField=${displayField} displayValue=${displayValue}`,
        error: JSON.stringify(errors),
      };
    }

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
      ctx.db.patch(mutation.payload['id'], {
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
    const errors = viewConfigManager.validateRecord(record, true);
    if (errors) {
      return {
        status: ERROR_STATUS.INVALID_RECORD,
        message: `Error updating record. Record=${JSON.stringify(record)} ID=${
          mutation.payload.id
        }`,
        error: JSON.stringify(errors),
      };
    }

    await ctx.db.patch(mutation.payload['id'], record);
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

  const record = await ctx.db.get(mutation.payload.id);

  const recordsWithInclude = await mapWithInclude([record], ctx, {
    ...props,
    viewId: props.viewId ?? null,
  });

  const result = viewConfigManager.viewConfig.mutation?.beforeSelect?.(record, {
    newIds,
    deleteIds: idsToDelete,
    recordWithInclude: recordsWithInclude?.[0],
    field: field.name,
  });

  if (result && 'error' in result) {
    return {
      status: ERROR_STATUS.INTERNAL_SERVER_ERROR,
      message: `Error selecting records. newIDs=${idsToDelete} deleteIDs=${newIds}`,
      error: result.error,
    };
  }

  try {
    await insertIds(newIds as ID[], props, ctx, field, record);
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

export const userViewMutation = async (
  ctx: GenericMutationCtx,
  props: MutationPropsServer
) => {
  const { mutation, viewConfigManager } = props;

  if (mutation.type !== 'USER_VIEW_MUTATION')
    throw new Error('INVALID MUTATION-5');

  const { displayOptions, filters, name, type, description } = mutation.payload;

  const dbMutation = mutationClient(ctx);
  const dbQuery = queryClient(ctx, 'views');

  const viewName = mutation.payload.name;

  if (type === 'CREATE_VIEW') {
    try {
      await dbMutation.insert('views', {
        name: name,
        description,
        baseView: viewConfigManager.getViewName(),
        displayOptions,
        filters,
        slug: slugHelper().slugify(name),
      });
    } catch (error) {
      return {
        status: ERROR_STATUS.INTERNAL_SERVER_ERROR,
        message: `Error creating user view. name=${name}`,
        error: getErrorMessage(error),
      };
    }
    return {
      message: 'User view created successfully',
      status: 201 as const,
    } as const;
  }

  if (type === 'UPDATE_VIEW') {
    let view: ConvexRecord | null = null;
    try {
      view = await dbQuery
        .withIndex('name', (q) => q.eq('name', viewName))
        .first();
    } catch (error) {
      return {
        status: ERROR_STATUS.INTERNAL_SERVER_ERROR,
        message: `Error fetching user view. name=${name}`,
        error: getErrorMessage(error),
      };
    }

    if (view) {
      try {
        await dbMutation.patch(view._id, {
          displayOptions,
          filters,
          name,
          description: description ?? '',
        });
        return {
          message: 'User view updated successfully',
          status: 200 as const,
        };
      } catch (error) {
        return {
          status: ERROR_STATUS.INTERNAL_SERVER_ERROR,
          message: `Error updating user view. name=${name}`,
          error: getErrorMessage(error),
        };
      }
    } else {
      try {
        const baseView = viewConfigManager.getViewName();
        await dbMutation.insert('views', {
          baseView,
          displayOptions,
          filters,
          name: baseView,
          description: description ?? '',
        });
        return {
          message: 'User view created successfully',
          status: 201 as const,
        };
      } catch (error) {
        return {
          status: ERROR_STATUS.INTERNAL_SERVER_ERROR,
          message: `Error creating user view. name=${name}`,
          error: getErrorMessage(error),
        };
      }
    }
  }

  throw new Error(
    `Invalid mutation type for user view. type=${type} name=${name}`
  );
};

export const mutationHandlers: MUTATION_HANDLER_CONVEX = {
  CREATE_RECORD: createMutation,
  DELETE_RECORD: deleteMutation,
  UPDATE_RECORD: updateMutation,
  SELECT_RECORDS: selectRecordsMutation,
  USER_VIEW_MUTATION: userViewMutation,
};
