import { QueryDto } from '@apps-next/core';
import { asyncMap } from 'convex-helpers';
import { ConvexViewConfigManager } from '../convex-view-config';
import { queryClient } from './convex-client';
import { GenericQueryCtx } from './convex.server.types';
import { withSearch } from './convex-searching';

export const getData = async (
  ctx: GenericQueryCtx,
  viewConfigManager: ConvexViewConfigManager,
  args: QueryDto
) => {
  const dbQuery = queryClient(ctx, viewConfigManager.getTableName());
  const include = viewConfigManager.getIncludeFields();

  const searchField = viewConfigManager.getSearchableField();

  const rawData = await asyncMap(
    withSearch(dbQuery, { searchField, query: args.query }).take(10),
    async (recordWithoutRelations) => {
      const extendedRecord = await include.reduce(async (acc, key) => {
        const field = viewConfigManager.getFieldBy(key);
        if (!field.relation) {
          return acc;
        }

        const accResolved = await acc;

        const record = await ctx.db
          .query(field.relation.tableName)
          .withIndex('by_id', (q: any) =>
            q.eq('_id', recordWithoutRelations[field.relation?.fieldName ?? ''])
          )
          .first();

        return {
          ...accResolved,
          [field.relation.tableName]: record,
        };
      }, Promise.resolve(recordWithoutRelations));

      return extendedRecord;
    }
  );

  return rawData.map((item) => {
    return {
      ...item,
      id: item._id,
    };
  });
};
