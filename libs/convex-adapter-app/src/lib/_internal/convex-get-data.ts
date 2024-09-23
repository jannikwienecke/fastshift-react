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
  const { viewConfigManager, filters } = args;

  const isTask = viewConfigManager?.getTableName() === 'tasks';
  const log = (...args: any[]) => {
    if (!isTask) return;
    console.log('___: ', ...args);
  };

  const dbQuery = queryClient(ctx, viewConfigManager.getTableName());

  const _indexFields = viewConfigManager.getIndexFields();
  const _searchFields = viewConfigManager.getSearchableFields();

  const displayField = viewConfigManager.getDisplayFieldLabel();

  const {
    primitiveFilters,
    oneToManyFilters,
    manyToManyFilters,
    enumFilters,
    hasOneToManyFilter,
    hasManyToManyFilter,
    stringFilters,
    filtersWithIndexField,
    filtersWithSearchField,
    searchFields,
    indexFields,
  } = getFilterTypes(filters, _searchFields, _indexFields);

  const isIndexSearch = filtersWithIndexField?.find(
    (f) => f.operator.label === 'contains'
  );
  const isSearchFieldSearch = filtersWithSearchField?.find(
    (f) => f.operator.label === 'contains'
  );

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

  // HIER WEITER MACHEN
  // for enum filters & primitive filters
  // we do a regular filter after we fetched the rows (like the string filters)
  // since the dbQuery.filter is the same
  // then: check if it works if we set a index for the enum filters

  // dbQuery = withEnumFilters(
  //   enumFilters,
  //   withPrimitiveFilters(primitiveFilters, dbQuery)
  // );

  // const idsSearchAndFilter =
  //   enumFilters.length || primitiveFilters.length
  //     ? (await queryWithSearchAndFilter.collect())
  //         .map((row) => row._id)
  //         .filter((a) => a !== undefined)
  //     : [];

  const allIds = arrayIntersection(
    hasManyToManyFilter ? idsManyToManyFilters : null,
    hasOneToManyFilter ? idsOneToManyFilters : null,
    // idsSearchAndFilter.length ? idsSearchAndFilter : null,
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
    const idsAfterRemove = allIds?.filter((id) => !idsToRemove.includes(id));

    const getAll = () => {
      console.warn(
        'Querying complete table. Use Index or search index if possible.'
      );
      return dbQuery.collect();
    };
    const rowsBeforeFilter =
      allIds !== null
        ? await getRecordsByIds(idsAfterRemove ?? [], dbQuery)
        : await getAll();

    const r = await filterResults(
      rowsBeforeFilter,
      displayField,
      args.query,
      stringFilters,
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
