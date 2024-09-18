import {
  arrayIntersection,
  DEFAULT_FETCH_LIMIT_QUERY,
  QueryServerProps,
} from '@apps-next/core';
import { queryClient } from './convex-client';
import { filterResults } from './convex-filter-results';
import { getFilterTypes } from './convex-get-filters';
import {
  getIdsFromManyToManyFilters,
  getIdsFromOneToManyFilters,
  getRecordsByIds,
} from './convex-get-ids-from';
import { mapWithInclude } from './convex-map-with-include';
import {
  withEnumFilters,
  withPrimitiveFilters,
  withSearch,
} from './convex-searching';
import { parseConvexData } from './convex-utils';
import { GenericQueryCtx } from './convex.server.types';
import { ConvexRecord } from './types.convex';

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
    hasOneToManyFilter,
    hasManyToManyFilter,
  } = getFilterTypes(filters, searchField);

  const {
    ids: idsManyToManyFilters,
    idsToRemove: idsManyToManyFiltersToRemove,
  } = await getIdsFromManyToManyFilters(
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
    enumFilters.length ||
    primitiveFilters.length ||
    args.query ||
    filterWithSearchField
      ? (await queryWithSearchAndFilter.collect())
          .map((row) => row._id)
          .filter((a) => a !== undefined)
      : [];

  const allIds = arrayIntersection(
    hasManyToManyFilter ? idsManyToManyFilters : null,
    hasOneToManyFilter ? idsOneToManyFilters : null,
    idsSearchAndFilter.length ? idsSearchAndFilter : null
  );

  const hasAnyFilterSet =
    primitiveFilters.length ||
    args.query ||
    filterWithSearchField ||
    hasManyToManyFilter ||
    hasOneToManyFilter ||
    enumFilters.length;

  const idsToRemove = Array.from(
    new Set([...idsManyToManyFiltersToRemove, ...idsOneToManyFiltersToRemove])
  );

  const fetch = async (multiple?: number) => {
    const idsAfterRemove = allIds.filter((id) => !idsToRemove.includes(id));

    const r = await filterResults(
      hasAnyFilterSet
        ? await getRecordsByIds(idsAfterRemove, dbQuery)
        : await dbQuery.take(DEFAULT_FETCH_LIMIT_QUERY * (multiple ?? 1)),
      displayField,
      args.query,
      searchField,
      filters?.filter(
        (f) => f.type === 'primitive' && f.field.type === 'String'
      )
    );

    return r;
  };

  const rows: ConvexRecord[] = [];

  for (let i = 1; i < (hasAnyFilterSet ? 2 : 10); i++) {
    const newRows = await fetch(i);
    const filtered = newRows.filter(
      (r) =>
        !idsToRemove.includes(r._id) && !rows.map((r) => r._id).includes(r._id)
    );

    rows.push(...filtered);

    if (
      rows.length >= DEFAULT_FETCH_LIMIT_QUERY ||
      filtered.length === 0 ||
      newRows.length < DEFAULT_FETCH_LIMIT_QUERY
    ) {
      break;
    }
  }

  const rawData = await mapWithInclude(
    rows.slice(0, DEFAULT_FETCH_LIMIT_QUERY),
    ctx,
    args
  );

  return parseConvexData(rawData);
};
