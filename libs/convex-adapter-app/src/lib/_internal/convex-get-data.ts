import {
  arrayIntersection,
  DEFAULT_FETCH_LIMIT_QUERY,
  QueryServerProps,
} from '@apps-next/core';
import { queryClient } from './convex-client';
import { mapWithInclude } from './convex-map-with-include';
import {
  withEnumFilters,
  withPrimitiveFilters,
  withSearch,
} from './convex-searching';
import { parseConvexData } from './convex-utils';
import { GenericQueryCtx } from './convex.server.types';
import { filterResults } from './convex-filter-results';
import { getFilterTypes } from './convex-get-filters';
import {
  getIdsFromManyToManyFilters,
  getIdsFromOneToManyFilters,
  getRecordsByIds,
} from './convex-get-ids-from';

export const getData = async (ctx: GenericQueryCtx, args: QueryServerProps) => {
  const { viewConfigManager, filters } = args;

  const dbQuery = queryClient(ctx, viewConfigManager.getTableName());

  const searchField = viewConfigManager.getSearchableField();
  const displayField = viewConfigManager.getDisplayFieldLabel();

  const {
    primitiveFilters,
    oneToManyFilters,
    manyToManyFilters,
    filterWithSearchField,
    enumFilters,
  } = getFilterTypes(filters, searchField);

  const idsManyToManyFilters = await getIdsFromManyToManyFilters(
    manyToManyFilters,
    ctx,
    viewConfigManager
  );

  // HIER WEITER MACHEN -> same for many to many
  const { ids: idsOneToManyFilters, idsToRemove: idsOneToManyFiltersToRemove } =
    await getIdsFromOneToManyFilters(oneToManyFilters, ctx, viewConfigManager);

  const queryWithSearchAndFilter = withEnumFilters(
    enumFilters,
    withPrimitiveFilters(
      primitiveFilters,
      withSearch(dbQuery, {
        searchField,
        query: args.query,
        filterWithSearch: filterWithSearchField,
      })
    )
  );

  const idsSearchAndFilter =
    enumFilters ||
    primitiveFilters.length ||
    args.query ||
    filterWithSearchField
      ? (await queryWithSearchAndFilter.collect())
          .map((row) => row._id)
          .filter((a) => a !== undefined)
      : [];

  const hasOneToManyFilter = oneToManyFilters.find(
    (f) => f.operator.label === 'is'
  )
    ? idsOneToManyFilters
    : null;

  const allIds = arrayIntersection(
    manyToManyFilters.length ? idsManyToManyFilters : null,
    hasOneToManyFilter ? idsOneToManyFilters : null,
    idsSearchAndFilter.length ? idsSearchAndFilter : null
  );

  const hasAnyFilterSet =
    primitiveFilters.length ||
    args.query ||
    filterWithSearchField ||
    manyToManyFilters.length ||
    hasOneToManyFilter ||
    enumFilters.length;

  const idsToRemove = idsOneToManyFiltersToRemove;

  const rows = filterResults(
    hasAnyFilterSet
      ? await getRecordsByIds(allIds, dbQuery)
      : await dbQuery.take(DEFAULT_FETCH_LIMIT_QUERY),
    // : await dbQuery.collect(),
    displayField,
    args.query,
    searchField,
    filters?.filter((f) => f.type === 'primitive' && f.field.type === 'String')
  );

  const rawData = await mapWithInclude(
    rows.filter((r) => !idsToRemove.includes(r._id)),
    // rows,
    ctx,
    args
  );

  return parseConvexData(rawData);
};

// NEXT STEPS
// - [x] write tests for (oneToManyFilters, manyToManyFilters)
// - [x] refacotr above code and code in convex-seaching
// - [ ] update the ui so we can set primitive filters
// - [ ] write tests for (primitiveFilters)
