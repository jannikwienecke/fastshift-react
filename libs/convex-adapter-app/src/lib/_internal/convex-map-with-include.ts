import { BaseViewConfigManagerInterface } from '@apps-next/core';
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
