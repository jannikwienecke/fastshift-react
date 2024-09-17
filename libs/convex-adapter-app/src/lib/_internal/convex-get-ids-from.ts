import {
  BaseViewConfigManagerInterface,
  DEFAULT_FETCH_LIMIT_QUERY,
  FilterType,
  ID,
} from '@apps-next/core';
import { asyncMap } from 'convex-helpers';
import { queryClient } from './convex-client';
import { GenericQueryCtx } from './convex.server.types';
import { ConvexClient } from './types.convex';

/*
  Get records by ids
  @param ids
  @param dbQuery
  @returns
*/
export const getRecordsByIds = async (
  ids: ID[],
  dbQuery: ConvexClient[string]
) => {
  return await asyncMap(ids.slice(0, DEFAULT_FETCH_LIMIT_QUERY), async (id) => {
    return await dbQuery.withIndex('by_id', (q) => q.eq('_id', id)).first();
  });
};

/**
 * Get ids from many to many filters
 * E.g.: On the view Task, we filter by one or more tags.
 * -> We want all tasks that have at least one of the tags.
 * @param manyToManyFilters
 * @param ctx - Convex context
 * @returns
 */
export const getIdsFromManyToManyFilters = async (
  manyToManyFilters: FilterType[],
  ctx: GenericQueryCtx,
  viewConfigManager: BaseViewConfigManagerInterface
): Promise<ID[]> => {
  const idsLists = await asyncMap(manyToManyFilters, async (filter) => {
    // e.g.: at TaskView -> tagId
    const fieldNameFilter =
      filter?.field.relation?.manyToManyModelFields?.find(
        (f) => f.name === filter.field.name
      )?.relation?.fieldName ?? '';

    // e.g.: at TaskView -> taskId
    const fieldNameView =
      filter?.field.relation?.manyToManyModelFields?.find(
        (f) => f.name === viewConfigManager.getTableName()
      )?.relation?.fieldName ?? '';

    // e.g: TaskTag
    const manyToManyTable = filter?.field.relation?.manyToManyTable ?? '';
    // e.g.: ['tagId']
    const values = filter?.type === 'relation' ? filter.values : [];

    const idLists = await asyncMap(values, async (value) => {
      if (!manyToManyTable || !fieldNameFilter) return null;

      return (
        await queryClient(ctx, manyToManyTable)
          .withIndex(fieldNameFilter, (q) => q.eq(fieldNameFilter, value.id))
          .collect()
      )?.map((manyToManyRow) => manyToManyRow[fieldNameView]);
    });

    const ids = idLists.filter((id) => id !== null).flat() as ID[];

    return [...new Set(ids)];
  });

  return [...new Set(idsLists.flat())];
};

/**
 * Get ids from one to many filters
 * E.g.: On the view Task, we filter by one or more projects.
 * -> We want all tasks that have at least one of the projects.
 * @param manyToManyFilters
 * @param ctx - Convex context
 * @returns
 */
export const getIdsFromOneToManyFilters = async (
  relationalFilters: FilterType[],
  ctx: GenericQueryCtx,
  viewConfigManager: BaseViewConfigManagerInterface
) => {
  const tableName = viewConfigManager.getTableName();

  const listOfIds = await asyncMap(relationalFilters ?? [], async (filter) => {
    const values = filter.type === 'relation' ? filter.values : [];

    // e.g.: at TaskView -> projectId
    const fieldName = filter.field.relation?.fieldName;
    if (!fieldName) return [];

    const mapped = await asyncMap(values, async (row) => {
      const id = row.id;
      if (!id) return null;

      const tasks = await queryClient(ctx, tableName)
        .withIndex(fieldName, (q) => q.eq(fieldName, id))
        .collect();

      return tasks.map((task) => task._id);
    });

    const ids = mapped
      .filter((a) => a !== null)
      .filter((a) => a !== undefined)
      .flat();

    return ids as ID[];
  });

  return [...new Set(listOfIds.flat())];
};
