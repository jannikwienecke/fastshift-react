import {
  BaseViewConfigManagerInterface,
  FieldConfig,
  MutationPropsServer,
} from '@apps-next/core';
import { asyncMap } from 'convex-helpers';
import { mutationClient } from './convex-client';
import { getRelationTableRecords } from './convex-get-relation-table-records';
import { GenericMutationCtx } from './convex.server.types';
import { ConvexRecordType, ID } from './types.convex';

export const deleteIds = async (
  ids: ID[],
  { viewConfigManager, registeredViews, mutation }: MutationPropsServer,
  ctx: GenericMutationCtx,
  field: FieldConfig
) => {
  const tableFieldName = getTableFieldName(viewConfigManager, field);
  const fieldNameRelationTable = getRelationTableFieldName(field);

  await asyncMap(ids, async (id) => {
    if (!fieldNameRelationTable && tableFieldName) {
      await ctx.db.patch(id, { [tableFieldName]: undefined });
    } else if (fieldNameRelationTable && tableFieldName) {
      const records = await getRelationTableRecords({
        registeredViews,
        id: id,
        relation: field.relation?.manyToManyTable as string,
        fieldName: fieldNameRelationTable,
        ctx,
      });

      const _id = records.find(
        (r: ConvexRecordType) => r[tableFieldName] === mutation?.payload.id
      )?._id;

      // TODO:
      // RUN TESTS -> check
      // BUILD SUCCESS -> check
      // COMMIT AND PUSH -> check
      // HANDLE CASE: Mutation does not work (comment out next line)
      // and make sure the client reflects the changes
      // update the list.selectedRelationField.row.raw for non many to many relations
      // handle case project filter in task view -> no project assigned
      if (_id) await mutationClient(ctx).delete(_id);
    }
  });
};

export const insertIds = async (
  ids: ID[],
  { viewConfigManager, mutation }: MutationPropsServer,
  ctx: GenericMutationCtx,
  field: FieldConfig
) => {
  const tableFieldName = getTableFieldName(viewConfigManager, field);
  const fieldNameRelationTable = getRelationTableFieldName(field);

  await asyncMap(ids, async (value) => {
    if (!fieldNameRelationTable && tableFieldName) {
      await ctx.db.patch(value, { [tableFieldName]: mutation.payload.id });
    } else if (field.relation?.manyToManyTable) {
      await mutationClient(ctx).insert(
        field.relation.manyToManyTable as string,
        {
          taskId: mutation.payload.id,
          tagId: value,
        }
      );
    }
  });
};

/**
 * Get the table field name of the relation table
 * E.g. We are on View Projects -> tableFieldName = "projectId"
 */
export const getTableFieldName = (
  viewConfigManager: BaseViewConfigManagerInterface,
  field: FieldConfig
) => {
  return field.relation?.manyToManyModelFields?.find(
    (f) =>
      f.name.toLowerCase() === viewConfigManager.getTableName().toLowerCase()
  )?.relation?.fieldName;
};

/**
 * For many To Many relations
 * E.g. We are on View Tasks -> Update Tag -> Relation Table is "tasks_tags"
 */
export const getRelationTableFieldName = (field: FieldConfig) => {
  return field.relation?.manyToManyModelFields?.find(
    (f) => f.name.toLowerCase() === field.relation?.fieldName.toLowerCase()
  )?.relation?.fieldName;
};
