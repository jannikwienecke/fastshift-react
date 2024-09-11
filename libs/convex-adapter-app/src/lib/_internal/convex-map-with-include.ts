import {
  BaseViewConfigManagerInterface,
  DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
} from '@apps-next/core';
import { asyncMap } from 'convex-helpers';
import { GenericQueryCtx } from './convex.server.types';
import { ConvexRecord } from './types.convex';
import { queryClient } from './convex-client';

export const mapWithInclude = async (
  rows: ConvexRecord[],
  viewConfigManager: BaseViewConfigManagerInterface,
  ctx: GenericQueryCtx
) => {
  const include = viewConfigManager.getIncludeFields();

  return await asyncMap(rows, async (recordWithoutRelations) => {
    const extendedRecord = await include.reduce(async (acc, key) => {
      const field = viewConfigManager.getFieldBy(key);

      if (!field.relation) {
        return acc;
      }

      const accResolved = await acc;

      if (field.relation.manyToManyTable) {
        // handle many to many
        // like: Tasks has Many tags <-> Tags has Many Tasks
        // we have a tasks_tags table
        // query the table with the task id

        const fieldNameManyToMany = field.relation.manyToManyModelFields?.find(
          (f) => f.name === viewConfigManager.getTableName()
        )?.relation?.fieldName;

        if (!fieldNameManyToMany) {
          console.log(field);
          console.log(viewConfigManager.getTableName());

          throw new Error('Many to many field name not found');
        }

        const client = queryClient(ctx, field.relation.manyToManyTable);

        let records: ConvexRecord[] = [];
        try {
          records = await client
            // TODO: Fix this. Hardcoded for now.
            .withIndex(fieldNameManyToMany, (q) =>
              q.eq(fieldNameManyToMany, recordWithoutRelations._id)
            )
            .take(DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY);
        } catch (error) {
          const invalidIndex = String(error).includes(
            "doesn't index this field"
          );
          if (invalidIndex) {
            throw new Error(
              `Please use the field name as the index name ${fieldNameManyToMany}`
            );
          } else {
            throw error;
          }
        }

        if (records.length) {
          records = await asyncMap(records, async (taskTag) => {
            const tag = await queryClient(ctx, key)
              // TODO: Fix this. Hardcoded for now.
              .withIndex('by_id', (q) => q.eq('_id', taskTag['tagId']))
              .first();

            return {
              id: tag?._id,
              ...taskTag,
              ...tag,
            };
          });
        }

        return {
          ...accResolved,
          [key]: records,
        };
      }

      const client = queryClient(ctx, field.relation.tableName);
      const record = await client
        .withIndex('by_id', (q) =>
          q.eq('_id', recordWithoutRelations[field.relation?.fieldName ?? ''])
        )
        .first();

      return {
        ...accResolved,
        [field.relation.tableName]: record,
      };
    }, Promise.resolve(recordWithoutRelations));

    return extendedRecord;
  });
};
