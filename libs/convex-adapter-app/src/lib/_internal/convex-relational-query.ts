import {
  BaseViewConfigManager,
  DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
  QueryServerProps,
  relationalViewHelper,
} from '@apps-next/core';
import { filterByNotDeleted, queryClient } from './convex-client';
import { filterResults } from './convex-filter-results';
import { mapWithInclude } from './convex-map-with-include';
import { withSearch } from './convex-searching';
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

  const indexFieldDeleted = relationalViewManager.getSoftDeleteIndexField();

  const searchFields = relationalViewManager.getSearchableFields() || [];

  const query = queryClient(ctx, field.name);

  const rowsNotDeleted = indexFieldDeleted
    ? await filterByNotDeleted(query, indexFieldDeleted).collect()
    : null;

  const rowIdsNotDeleted = rowsNotDeleted?.map((row) => row._id) ?? null;

  const fetch = async () => {
    if (!args.query) {
      return indexFieldDeleted
        ? await filterByNotDeleted(dbQuery, indexFieldDeleted).take(
            DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY
          )
        : await dbQuery.take(DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY);
    }

    if (searchFields.length && args.query) {
      return await withSearch(dbQuery, {
        searchFields,
        query: args.query,
        rowIdsNotDeleted,
      });
    } else {
      // if we dont have a search field, we need to query the complete table
      // and then filter the results.
      console.warn(
        'Slow Query. No search field provided. Querying the complete table.'
      );
      const rows = indexFieldDeleted
        ? await filterByNotDeleted(dbQuery, indexFieldDeleted).collect()
        : await dbQuery.collect();

      return filterResults(
        rows,
        relationalViewManager.getDisplayFieldLabel(),
        args.query ?? '',
        [],
        searchFields
      ).slice(0, DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY);
    }
  };

  const rows = await fetch();

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
