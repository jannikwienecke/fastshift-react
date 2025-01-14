import {
  arrayIntersection,
  ContinueCursor,
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
  const { viewConfigManager, filters, registeredViews, displayOptions } = args;

  console.log(
    'displayOptions: sorting by: ',
    displayOptions?.sorting?.field.name
  );

  const isTask = viewConfigManager?.getTableName() === 'tasks';

  const logTask = (...args: any[]) => {
    if (!isTask) return;
    console.log('___: ', ...args);
  };

  const _indexFields = viewConfigManager.getIndexFields();
  const _searchFields = viewConfigManager.getSearchableFields();

  const displayField = viewConfigManager.getDisplayFieldLabel();

  let isDone = false;
  let isGetAll = false;
  const continueCursor: ContinueCursor = {
    position: null,
    cursor: null,
  };

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
      operator.label === 'is any of' ||
      operator.label === 'before' ||
      operator.label === 'after' ||
      operator.label === 'within'
  );
  const isSearchFieldSearch = filtersWithSearchField?.find(
    ({ operator }) =>
      operator.label === 'contains' ||
      operator.label === 'is' ||
      operator.label === 'is any of' ||
      operator.label === 'before' ||
      operator.label === 'after' ||
      operator.label === 'within'
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

  const position = args.paginateOptions?.cursor?.position ?? 0;
  const nextPosition = position + DEFAULT_FETCH_LIMIT_QUERY;

  const fetch = async (multiple?: number) => {
    const dbQuery = queryClient(ctx, viewConfigManager.getTableName());

    const idsAfterRemove = allIds?.filter((id) => !idsToRemove.includes(id));

    const getAll = () => {
      isGetAll = true;
      console.warn(
        'Querying complete table. Use Index or search index if possible.'
      );
      return dbQuery.collect();
    };

    const anyFilter = args.query || filtersWithoutIndexOrSearchField?.length;

    // TODO: HIER WEITER MACHEN.
    // We must check if there is an index for this sorting field
    // if not -> we must sort fetch all and sort manually after
    // add warning that this search might be expensive

    const rowsBeforeFilter =
      allIds !== null
        ? await getRecordsByIds(
            idsAfterRemove?.slice(position, nextPosition) ?? [],
            dbQuery
          )
        : anyFilter
        ? await getAll()
        : displayOptions?.sorting?.field.name
        ? await dbQuery.withIndex(displayOptions.sorting.field.name).paginate({
            cursor: args?.paginateOptions?.cursor?.cursor ?? null,
            numItems: DEFAULT_FETCH_LIMIT_QUERY + (idsToRemove.length ?? 0),
          })
        : await dbQuery.paginate({
            cursor: args?.paginateOptions?.cursor?.cursor ?? null,
            numItems: DEFAULT_FETCH_LIMIT_QUERY + (idsToRemove.length ?? 0),
          });

    const rows =
      'page' in rowsBeforeFilter ? rowsBeforeFilter.page : rowsBeforeFilter;

    if ('continueCursor' in rowsBeforeFilter) {
      continueCursor.cursor = rowsBeforeFilter.continueCursor;
      isDone = rowsBeforeFilter.isDone;
    }

    const r = await filterResults(
      rows,
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
    allIds !== null ? rows : rows.slice(position, nextPosition),
    ctx,
    args
  );

  if (allIds !== null || isGetAll) {
    const newItemsLength = allIds !== null ? allIds.length : newRows.length;

    isDone = nextPosition >= newItemsLength;
    continueCursor.position = isDone ? position : nextPosition;
  }

  const data = parseConvexData(rawData);

  // logTask({ filters: filters?.length, dat: data?.length });

  return { data, continueCursor, isDone };
};
