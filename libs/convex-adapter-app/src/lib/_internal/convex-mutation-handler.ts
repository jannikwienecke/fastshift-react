import {
  BaseViewConfigManagerInterface,
  FieldConfig,
  ManyToManyMutationProps,
  MutationPropsServer,
} from '@apps-next/core';
import { mutationClient } from './convex-client';
import { getRelationTableRecords } from './convex-get-relation-table-records';
import { ConvexContext } from './convex.db.type';
import { GenericMutationCtx, GenericQueryCtx } from './convex.server.types';
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
  const { mutation, viewConfigManager } = props;

  if (mutation.type !== 'UPDATE_RECORD') throw new Error('INVALID MUTATION-3');

  console.log('updateMutation', mutation.payload);

  const { id: _, ...data } = mutation.payload.record;

  const manyToManyRelations = Object.keys(data)
    .map((key) => {
      let field: FieldConfig | undefined;
      try {
        field = viewConfigManager.getFieldBy(key);
      } catch (error) {
        //
      }

      if (
        field?.relation?.manyToManyRelation &&
        field?.relation?.manyToManyTable &&
        field?.relation?.manyToManyModelFields
      ) {
        const value = data[key];
        delete data[key];

        return {
          fieldName: key,
          table:
            field.relation.type === 'manyToMany'
              ? field.relation.manyToManyRelation
              : field.relation.tableName,
          manyToManyTable: field.relation.manyToManyTable,
          values: typeof value === 'string' ? [value] : value,
          manyToManyModelFields: field.relation.manyToManyModelFields,
        } satisfies ManyToManyMutationProps;
      }

      return null;
    })
    .filter(Boolean) as ManyToManyMutationProps[];

  if (manyToManyRelations.length > 0) {
    await updateManyToManyMutation(ctx, props, manyToManyRelations);
  } else {
    await ctx.db.patch(mutation.payload.id, mutation.payload.record);
  }

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

export const updateManyToManyMutation = async (
  ctx: GenericMutationCtx,
  { viewConfigManager, mutation, registeredViews }: MutationPropsServer,
  manyToManyRelations: ManyToManyMutationProps[]
) => {
  const { id } = mutation.payload;

  for (const relation of manyToManyRelations) {
    const tableFieldName = getTableFieldName(relation, viewConfigManager);
    const fieldNameRelationTable = getRelationTableFieldName(relation);

    if (!tableFieldName) return;

    let toDeleteIds: ID[] = [];

    const { allIds: allExistingIds, allExistingRelationIds } =
      await getExistingIds(
        ctx,
        { viewConfigManager, mutation, registeredViews },
        relation
      );

    const idsToCompare = allExistingRelationIds.length
      ? allExistingRelationIds
      : allExistingIds;

    toDeleteIds = getToDeleteIds(idsToCompare, relation);
    for (const value of toDeleteIds) {
      const index = idsToCompare.indexOf(value);
      const id = allExistingIds[index];
      if (id) await mutationClient(ctx).delete(id);
    }

    // INSERT NEW VALUES
    for (const value of relation.values) {
      if (idsToCompare.map((v) => v.toString()).includes(value.toString())) {
        continue;
      }

      if (!fieldNameRelationTable) {
        await ctx.db.patch(value, { [tableFieldName]: id });
      } else {
        await mutationClient(ctx).insert(relation.manyToManyTable, {
          taskId: id,
          tagId: value,
        });
      }
    }
  }
};

export const getExistingIds = async (
  ctx: GenericQueryCtx,
  { viewConfigManager, mutation, registeredViews }: MutationPropsServer,
  relation: ManyToManyMutationProps
) => {
  const { id } = mutation.payload;
  const tableFieldName = getTableFieldName(relation, viewConfigManager);
  const relationTableFieldName = getRelationTableFieldName(relation);

  const allExisting = await getRelationTableRecords({
    registeredViews,
    id,
    relation: relation.manyToManyTable,
    fieldName: tableFieldName,
    ctx,
  });

  const allExistingRelationIds = allExisting
    .map((v) => v?.[relationTableFieldName ?? ''])
    .filter((f) => f !== undefined);

  const allExistingIds = allExisting
    .map((v) => v?._id)
    .filter((f) => f !== undefined);

  return {
    allIds: allExistingIds,
    allExistingRelationIds,
  };
};

/**
 * Get the table field name of the relation table
 * E.g. We are on View Projects -> tableFieldName = "projectId"
 */
export const getTableFieldName = (
  relation: ManyToManyMutationProps,
  viewConfigManager: BaseViewConfigManagerInterface
) => {
  const tableFieldName = relation.manyToManyModelFields.find(
    (f) =>
      f.name.toLowerCase() === viewConfigManager.getTableName().toLowerCase()
  )?.relation?.fieldName;

  if (!tableFieldName) throw new Error('tableFieldName not found');

  return tableFieldName;
};

/**
 * For many To Many relations
 * E.g. We are on View Tasks -> Update Tag -> Relation Table is "tasks_tags"
 */
export const getRelationTableFieldName = (
  relation: ManyToManyMutationProps
) => {
  const fieldNameRelationTable = relation.manyToManyModelFields.find(
    (f) => f.name.toLowerCase() === relation.fieldName.toLowerCase()
  )?.relation?.fieldName;

  return fieldNameRelationTable;
};

export const getToDeleteIds = (
  allExistingIds: ID[],
  relation: ManyToManyMutationProps
) => {
  return allExistingIds.filter((v) => !relation.values.includes(v));
};
