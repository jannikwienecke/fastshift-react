import {
  BaseViewConfigManagerInterface,
  FieldConfig,
  INTERNAL_FIELDS,
  MutationPropsServer,
} from '@apps-next/core';
import { asyncMap } from 'convex-helpers';
import { mutationClient, queryClient } from './convex-client';
import { getRelationTableRecords } from './convex-get-relation-table-records';
import { GenericMutationCtx } from './convex.server.types';
import { ConvexRecordType, ID, RecordType } from './types.convex';

export const deleteIds = async (
  ids: ID[],
  {
    viewConfigManager,
    registeredViews,
    mutation,
    ...props
  }: MutationPropsServer,
  ctx: GenericMutationCtx,
  field: FieldConfig
) => {
  if (!ids || ids.length === 0) return;
  if (mutation.type !== 'SELECT_RECORDS') throw new Error('INVALID MUTATION-4');

  const tableFieldName = getTableFieldName(viewConfigManager, field);
  const fieldNameRelationTable = getRelationTableFieldName(field);

  if (field.isRecursive && tableFieldName) {
    const client = queryClient(ctx, field.name);

    const record = await client
      .withIndex('by_id', (q) => q.eq('_id', mutation.payload['id']))
      .first();

    const existingIds = record[tableFieldName] as ID[] | undefined | null;
    const after = existingIds?.filter(
      (existingId: ID) => !ids.includes(existingId)
    );

    await ctx.db.patch(mutation.payload['id'], {
      [tableFieldName]: after,
      [INTERNAL_FIELDS.updatedBy.fieldName]: props.user?.['_id'],
      [INTERNAL_FIELDS.updatedAt.fieldName]: Date.now(),
    });

    return;
  }

  await asyncMap(ids, async (id) => {
    if (field.relation?.type === 'oneToMany' && tableFieldName) {
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
        (r: ConvexRecordType) => r[tableFieldName] === mutation?.payload['id']
      )?._id;

      if (_id) {
        await mutationClient(ctx).delete(_id);
      }
    }
  });
};

export const insertIds = async (
  ids: ID[],
  { viewConfigManager, mutation, ...props }: MutationPropsServer,
  ctx: GenericMutationCtx,
  field: FieldConfig,
  record: RecordType
) => {
  if (mutation.type !== 'SELECT_RECORDS') throw new Error('INVALID MUTATION-4');

  const tableFieldName = getTableFieldName(viewConfigManager, field);
  if (!ids || ids.length === 0) return;

  if (field.isRecursive && tableFieldName) {
    const existingIds = record[tableFieldName] as ID[] | undefined | null;

    await ctx.db.patch(mutation.payload['id'], {
      [tableFieldName]: [...(existingIds || []), ...ids],
      [INTERNAL_FIELDS.updatedBy.fieldName]: props.user?.['_id'],
      [INTERNAL_FIELDS.updatedAt.fieldName]: Date.now(),
    });

    return;
  }

  const relationFieldName = field.relation?.manyToManyModelFields?.find(
    (f) => f.relation?.tableName === field.name
  )?.relation?.fieldName;
  await asyncMap(ids, async (value) => {
    if (field.relation?.type === 'oneToMany' && tableFieldName) {
      await ctx.db.patch(value, {
        [tableFieldName]: mutation.payload['id'],
        [INTERNAL_FIELDS.updatedBy.fieldName]: props.user?.['_id'],
        [INTERNAL_FIELDS.updatedAt.fieldName]: Date.now(),
      });
    } else if (
      field.relation?.manyToManyTable &&
      tableFieldName &&
      relationFieldName
    ) {
      await mutationClient(ctx).insert(
        field.relation.manyToManyTable as string,
        {
          [tableFieldName]: mutation.payload['id'],
          [relationFieldName]: value,
          // [INTERNAL_FIELDS.deleted.fieldName]: false,
          // [INTERNAL_FIELDS.createdBy.fieldName]: props.user?.["_id"],
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
