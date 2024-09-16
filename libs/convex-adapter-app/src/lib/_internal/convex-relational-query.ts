import {
  DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
  QueryServerProps,
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
  args: QueryServerProps;
}) => {
  const { viewConfigManager } = args;

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
  }).collect();

  rows = await filterResults(
    rows,
    relationalViewManager.getDisplayFieldLabel(),
    args.query ?? '',
    searchField
  ).slice(0, DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY);

  const rowsWithInclude = await mapWithInclude(rows, ctx, args);

  return {
    data: rowsWithInclude.map((row) => {
      return {
        ...row,
        id: row._id,
      };
    }),
  };
};
