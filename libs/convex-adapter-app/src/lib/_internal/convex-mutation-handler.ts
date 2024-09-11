import {
  BaseViewConfigManagerInterface,
  ManyToManyMutationProps,
  MutationPropsServer,
} from '@apps-next/core';
import { MUTATION_HANDLER_CONVEX } from './types.convex.mutation';
import { ConvexContext } from './convex.db.type';
import { GenericMutationCtx, GenericQueryCtx } from './convex.server.types';
import { mutationClient, queryClient } from './convex-client';
import { ID } from './types.convex';

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
      const field = viewConfigManager.getFieldBy(key);

      if (
        field.relation?.manyToManyRelation &&
        field.relation.manyToManyTable &&
        field.relation.manyToManyModelFields
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

  console.log('manyToManyRelations', manyToManyRelations);
  if (manyToManyRelations.length > 0) {
    await updateManyToManyMutation(ctx, props, manyToManyRelations);
  }

  //await ctx.db.patch(mutation.payload.id, mutation.payload.record);

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

// TODO refactor this whole function -> split into oneToMany and manyToMany
export const updateManyToManyMutation = async (
  ctx: GenericMutationCtx,
  { viewConfigManager, mutation }: MutationPropsServer,
  manyToManyRelations: ManyToManyMutationProps[]
) => {
  const { id } = mutation.payload;

  for (const relation of manyToManyRelations) {
    const tableFieldName = getTableFieldName(relation, viewConfigManager);
    const fieldNameRelationTable = getRelationTableFieldName(relation);

    if (!tableFieldName) return;

    const exisitingValues: string[] = [];
    if (fieldNameRelationTable) {
      // TODO HIER WEITER MACHEN
      console.log({ fieldNameTable: tableFieldName, fieldNameRelationTable });
      console.log('MANY TO MANY FIELD');
      // const allExisting = await relationTableClient.findMany({
      //   where: {
      //     // the table where we are currently on. Tasks -> has tags (we update a tag) -> taskId
      //     [fieldNameTable]: id,
      //     // the relation table field -> tagId
      //   },
      //   select: {
      //     [fieldNameRelationTable]: true,
      //   },
      // });

      // const toDelete = allExisting
      //   .map((v) => v?.[fieldNameRelationTable])
      //   .filter((v) => !relation.values.includes(v));

      // await relationTableClient.deleteMany({
      //   where: {
      //     [fieldNameRelationTable]: {
      //       in: toDelete,
      //     },
      //   },
      // });
    } else {
      // CASE EXAMPLE:
      // We are on view "projects". And Select or delselect a task
      // we get all tasks ids of that project
      // and we delete all that were not sent from the frontend
      const allExistingIds = await getExistingIds(
        ctx,
        { viewConfigManager, mutation },
        relation
      );

      const toDelete = await getToDeleteIds(allExistingIds, relation);

      exisitingValues.push(...allExistingIds);

      for (const value of toDelete) {
        await mutationClient(ctx).delete(value);
      }
    }

    // INSERT NEW VALUES
    for (const value of relation.values) {
      if (exisitingValues.includes(value.toString())) {
        continue;
      }

      if (!fieldNameRelationTable) {
        // case: Update a task by setting the project id
        await ctx.db.patch(value, { [tableFieldName]: id });
      } else {
        // const hasRecord = await relationTableClient.findMany({
        //   where: {
        //     // the table where we are currently on. Tasks -> has tags (we update a tag) -> taskId
        //     [fieldNameTable]: id,
        //     // the relation table field -> tagId
        //     [fieldNameRelationTable]: value,
        //   },
        // });
        // if (!(hasRecord.length > 0)) {
        //   await relationTableClient.create({
        //     data: {
        //       [fieldNameTable]: id,
        //       [fieldNameRelationTable]: value,
        //     },
        //   });
        // }
      }
    }
  }
};

export const getExistingIds = async (
  ctx: GenericQueryCtx,
  { viewConfigManager, mutation }: MutationPropsServer,
  relation: ManyToManyMutationProps
) => {
  const { id } = mutation.payload;
  const tableFieldName = getTableFieldName(relation, viewConfigManager);
  const relationTableClient = queryClient(ctx, relation.manyToManyTable);

  const allExistingIds = await (
    await relationTableClient
      .withIndex(tableFieldName, (q) => q.eq(tableFieldName, id))
      .collect()
  )
    .map((v) => v._id)
    .filter((f) => f !== undefined);

  return allExistingIds;
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

export const getToDeleteIds = async (
  allExistingIds: ID[],
  relation: ManyToManyMutationProps
) => {
  return allExistingIds.filter((v) => !relation.values.includes(v));
};
