import { DEFAULT_FETCH_LIMIT_QUERY, QueryServerProps } from '@apps-next/core';
import { queryClient } from './convex-client';
import { mapWithInclude } from './convex-map-with-include';
import { filterResults, withSearch } from './convex-searching';
import { GenericQueryCtx } from './convex.server.types';

export const getData = async (ctx: GenericQueryCtx, args: QueryServerProps) => {
  const { viewConfigManager, filters } = args;

  let dbQuery = queryClient(ctx, viewConfigManager.getTableName());

  const searchField = viewConfigManager.getSearchableField();
  const displayField = viewConfigManager.getDisplayFieldLabel();

  const filter = filters?.[0];
  const projectIds = (filter?.type === 'relation' ? filter.values : []).map(
    (val) => val.id
  );

  // TODO: MAKE GENERIC AND EXTRACT
  dbQuery =
    projectIds.length > 0
      ? (dbQuery as any).filter((q: any) =>
          q.or(
            ...projectIds.map((projectId) =>
              q.eq(q.field('projectId'), projectId)
            )
          )
        )
      : dbQuery;

  const rows = filterResults(
    await withSearch(dbQuery, { searchField, query: args.query }).take(
      DEFAULT_FETCH_LIMIT_QUERY
    ),
    displayField,
    args.query,
    searchField
  );

  const rawData = await mapWithInclude(rows, ctx, args);

  return rawData.map((item) => {
    return {
      ...item,
      id: item._id,
    };
  });
};
