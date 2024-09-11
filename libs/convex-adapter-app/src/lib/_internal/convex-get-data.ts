import { QueryDto } from '@apps-next/core';
import { ConvexViewConfigManager } from '../convex-view-config';
import { queryClient } from './convex-client';
import { mapWithInclude } from './convex-map-with-include';
import { filterResults, withSearch } from './convex-searching';
import { GenericQueryCtx } from './convex.server.types';

export const getData = async (
  ctx: GenericQueryCtx,
  viewConfigManager: ConvexViewConfigManager,
  args: QueryDto
) => {
  const dbQuery = queryClient(ctx, viewConfigManager.getTableName());

  const searchField = viewConfigManager.getSearchableField();
  const displayField = viewConfigManager.getDisplayFieldLabel();

  const rows = filterResults(
    await withSearch(dbQuery, { searchField, query: args.query }).take(10),
    displayField,
    args.query,
    searchField
  );

  const rawData = await mapWithInclude(rows, viewConfigManager, ctx);

  return rawData.map((item) => {
    return {
      ...item,
      id: item._id,
    };
  });
};
