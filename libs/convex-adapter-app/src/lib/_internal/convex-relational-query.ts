import {
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
}: {
  ctx: GenericQueryCtx;
  args: QueryDto;
}) => {
  if (!args.relationQuery?.tableName) throw new Error('No table name provided');

  const tableNameRelation = args.relationQuery?.tableName;

  const dbQuery = queryClient(ctx, tableNameRelation);
  const { relationalViewManager } = relationalViewHelper(
    tableNameRelation,
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
    ctx
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
