import {
  arrayIntersection,
  DEFAULT_FETCH_LIMIT_QUERY,
  QueryServerProps,
} from '@apps-next/core';
import { queryClient } from './convex-client';
import { filterResults } from './convex-filter-results';
import { getFilterTypes } from './convex-get-filters';
import {
  getIdsFromIndexFilters,
  getIdsFromManyToManyFilters,
  getIdsFromOneToManyFilters,
  getIdsFromQuerySearch,
  getIdsFromSearchFilters,
  getRecordsByIds,
} from './convex-get-ids-from';
import { mapWithInclude } from './convex-map-with-include';
import { parseConvexData } from './convex-utils';
import { GenericQueryCtx } from './convex.server.types';
import { ConvexRecord } from './types.convex';

export const getData = async (ctx: GenericQueryCtx, args: QueryServerProps) => {
  const { viewConfigManager, filters, registeredViews } = args;

  const isTask = viewConfigManager?.getTableName() === 'tasks';
  const log = (...args: any[]) => {
    if (!isTask) return;
    console.log('___: ', ...args);
  };

  const _indexFields = viewConfigManager.getIndexFields();
  const _searchFields = viewConfigManager.getSearchableFields();

  const displayField = viewConfigManager.getDisplayFieldLabel();

  const {
    filtersWithoutIndexOrSearchField,
    oneToManyFilters,
    manyToManyFilters,
    hasOneToManyFilter,
    hasManyToManyFilter,
    filtersWithIndexField,
    filtersWithSearchField,
    searchFields,
    indexFields,
  } = getFilterTypes(filters, _searchFields, _indexFields);

  const isIndexSearch = filtersWithIndexField?.find(
    ({ operator }) =>
      operator.label === 'contains' ||
      operator.label === 'is' ||
      operator.label === 'is any of'
  );
  const isSearchFieldSearch = filtersWithSearchField?.find(
    ({ operator }) =>
      operator.label === 'contains' ||
      operator.label === 'is' ||
      operator.label === 'is any of'
  );

  const {
    ids: idsManyToManyFilters,
    idsToRemove: idsManyToManyFiltersToRemove,
  } = await getIdsFromManyToManyFilters(
    manyToManyFilters,
    ctx,
    viewConfigManager,
    registeredViews
  );

  const { ids: idsOneToManyFilters, idsToRemove: idsOneToManyFiltersToRemove } =
    await getIdsFromOneToManyFilters(
      oneToManyFilters,
      ctx,
      viewConfigManager,
      registeredViews
    );

  const { ids: idsIndexField, idsToRemove: idsIndexFieldToRemove } =
    await getIdsFromIndexFilters(
      filtersWithIndexField,
      indexFields,
      ctx,
      viewConfigManager
    );

  const { ids: idsSearchField, idsToRemove: idsSearchToRemove } =
    await getIdsFromSearchFilters(
      filtersWithSearchField,
      searchFields,
      ctx,
      viewConfigManager
    );

  const idsQuerySearch = await getIdsFromQuerySearch(
    args.query,
    searchFields,
    ctx,
    viewConfigManager
  );

  const allIds = arrayIntersection(
    hasManyToManyFilter ? idsManyToManyFilters : null,
    hasOneToManyFilter ? idsOneToManyFilters : null,
    isIndexSearch ? idsIndexField : null,
    isSearchFieldSearch ? idsSearchField : null,
    args.query ? idsQuerySearch : null
  );

  const idsToRemove = Array.from(
    new Set([
      ...idsManyToManyFiltersToRemove,
      ...idsOneToManyFiltersToRemove,
      ...idsSearchToRemove,
      ...idsIndexFieldToRemove,
    ])
  );

  const fetch = async (multiple?: number) => {
    const dbQuery = queryClient(ctx, viewConfigManager.getTableName());

    const idsAfterRemove = allIds?.filter((id) => !idsToRemove.includes(id));

    const getAll = () => {
      console.warn(
        'Querying complete table. Use Index or search index if possible.'
      );
      return dbQuery.collect();
    };

    const anyFilter = args.query || filtersWithoutIndexOrSearchField?.length;

    const rowsBeforeFilter =
      allIds !== null
        ? await getRecordsByIds(idsAfterRemove ?? [], dbQuery)
        : anyFilter
        ? await getAll()
        : await dbQuery.take(DEFAULT_FETCH_LIMIT_QUERY);

    const r = await filterResults(
      rowsBeforeFilter,
      displayField,
      args.query,
      filtersWithoutIndexOrSearchField,
      searchFields
    );

    return r;
  };

  const rows: ConvexRecord[] = [];

  const newRows = await fetch();

  const filtered = newRows.filter(
    (r) =>
      !idsToRemove.includes(r._id) && !rows.map((r) => r._id).includes(r._id)
  );

  rows.push(...filtered);

  const rawData = await mapWithInclude(
    rows.slice(0, DEFAULT_FETCH_LIMIT_QUERY),
    ctx,
    args
  );

  return parseConvexData(rawData);
};
