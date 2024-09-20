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

  const isTask = viewConfigManager?.getTableName() === 'tasks';
  const log = (...args: any[]) => {
    if (!isTask) return;
    console.log('___: ', ...args);
  };

  const dbQuery = queryClient(ctx, viewConfigManager.getTableName());

  const searchFields = viewConfigManager.getSearchableFields();
  const primarySearchField = viewConfigManager.getPrimarySearchField();

  // TODO: REFACTOR THIS PART
  const filtersWithSearchField = filters?.filter((f) =>
    searchFields?.map((f) => f.field).includes(f.field.name)
  );

  const searchField =
    filtersWithSearchField?.length === 1
      ? searchFields?.find(
          (f) => f.field === filtersWithSearchField[0].field.name
        )
      : searchFields?.find((f) => f.field === primarySearchField);

  const displayField = viewConfigManager.getDisplayFieldLabel();

  const {
    primitiveFilters,
    oneToManyFilters,
    manyToManyFilters,
    filterWithSearchField,
    enumFilters,
    hasOneToManyFilter,
    hasManyToManyFilter,
    stringFilters,
  } = getFilterTypes(filters, searchField);

  const {
    ids: idsManyToManyFilters,
    idsToRemove: idsManyToManyFiltersToRemove,
  } = await getIdsFromManyToManyFilters(
    manyToManyFilters,
    ctx,
    viewConfigManager
  );

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

  let searchAll = false;
  const fetch = async (multiple?: number) => {
    if (searchAll) {
      return [];
    }

    searchAll = Boolean(stringFilters?.length || (args.query && !searchField));

    // TODO: mhhh Thoughts. Continue here.
    // Do the same with Index as with searchindex
    // for fields like dueDate or completed

    const idsAfterRemove = allIds.filter((id) => !idsToRemove.includes(id));

    log('idsAfterRemove: ', idsAfterRemove.length);

    const rowsBeforeFilter = hasAnyFilterSet
      ? await getRecordsByIds(idsAfterRemove, dbQuery)
      : searchAll
      ? await dbQuery.collect()
      : await dbQuery.take(DEFAULT_FETCH_LIMIT_QUERY * (multiple ?? 1));

    log('Rows Before::: ', rowsBeforeFilter.length);
    const r = await filterResults(
      rowsBeforeFilter,
      displayField,
      args.query,
      searchField,
      stringFilters
    );

    log('Rows After::: ', r.length);

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
      newRows.length === 0
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
