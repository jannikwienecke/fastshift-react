import {
  BaseViewConfigManager,
  DEFAULT_FETCH_LIMIT_QUERY,
  QueryDto,
} from '@apps-next/core';
import { queryClient } from './convex-client';
import { mapWithInclude } from './convex-map-with-include';
import { filterResults, withSearch } from './convex-searching';
import { GenericQueryCtx } from './convex.server.types';

export const getData = async (
  ctx: GenericQueryCtx,
  viewConfigManager: BaseViewConfigManager,
  args: QueryDto
) => {
  const dbQuery = queryClient(ctx, viewConfigManager.getTableName());

  const searchField = viewConfigManager.getSearchableField();
  const displayField = viewConfigManager.getDisplayFieldLabel();

  const rows = filterResults(
    await withSearch(dbQuery, { searchField, query: args.query }).take(
      DEFAULT_FETCH_LIMIT_QUERY
    ),
    displayField,
    args.query,
    searchField
  );

  const rawData = await mapWithInclude(rows, viewConfigManager, ctx, args);

  // console.log('rawData', rawData?.[rawData.length - 1]);

  return rawData.map((item) => {
    return {
      ...item,
      id: item._id,
    };
  });
};
