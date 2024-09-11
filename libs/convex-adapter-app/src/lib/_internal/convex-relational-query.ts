import {
  BaseViewConfigManagerInterface,
  DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
  QueryDto,
  relationalViewHelper,
} from '@apps-next/core';
import { queryClient } from './convex-client';
import { mapWithInclude } from './convex-map-with-include';
import { filterResults, withSearch } from './convex-searching';
import { GenericQueryCtx } from './convex.server.types';

export const handleRelationalTableQuery = async ({
  ctx,
  args,
  viewConfigManager,
}: {
  ctx: GenericQueryCtx;
  args: QueryDto;
  viewConfigManager: BaseViewConfigManagerInterface;
}) => {
  const relationQuery = args.relationQuery;
  if (!relationQuery?.tableName) throw new Error('No table name provided');

  const field = viewConfigManager.getRelationFieldByTableName(
    relationQuery.tableName
  );

  const dbQuery = queryClient(ctx, field.name);
  const { relationalViewManager } = relationalViewHelper(
    field.name,
    args.registeredViews
  );

  const searchField = relationalViewManager.getSearchableField();

  let rows = await withSearch(dbQuery, {
    searchField,
    query: args.query,
  }).take(DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY);

  rows = await filterResults(
    rows,
    relationalViewManager.getDisplayFieldLabel(),
    args.query ?? '',
    searchField
  );

  const rowsWithInclude = await mapWithInclude(
    rows,
    relationalViewManager,
    ctx,
    args
  );

  return {
    data: rowsWithInclude.map((row) => {
      return {
        ...row,
        id: row._id,
      };
    }),
  };
};
