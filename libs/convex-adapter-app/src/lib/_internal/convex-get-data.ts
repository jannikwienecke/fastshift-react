import {
  _log,
  arrayIntersection,
  ContinueCursor,
  DEFAULT_FETCH_LIMIT_QUERY,
  DEFAULT_MAX_ITEMS_GROUPING,
  QueryServerProps,
} from '@apps-next/core';
import { filterByNotDeleted, queryClient } from './convex-client';
import { getDisplayOptionsInfo } from './convex-display-options';
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
import { convexSortRows } from './convex-sort-rows';
import { parseConvexData } from './convex-utils';
import { GenericQueryCtx } from './convex.server.types';
import { ConvexRecordType } from './types.convex';

export const getData = async (ctx: GenericQueryCtx, args: QueryServerProps) => {
  const log = (...props: any[]) => {
    const view = args.viewConfigManager?.getTableName();
    if (view !== 'tasks') return;
    _log.info(...props);
  };

  const { viewConfigManager, filters, registeredViews } = args;

  const softDeleteEnabled = !!viewConfigManager.viewConfig.mutation?.softDelete;

  const _indexFields = viewConfigManager.getIndexFields();

  const _searchFields = viewConfigManager.getSearchableFields();

  const displayField = viewConfigManager.getDisplayFieldLabel();

  const displayOptionsInfo = getDisplayOptionsInfo(args);
  const showDeleted = displayOptionsInfo.showDeleted;

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

  const deletedIndexField = viewConfigManager.getSoftDeleteIndexField();

  const query = queryClient(ctx, viewConfigManager.getTableName());
  const rowsNotDeleted =
    softDeleteEnabled && !showDeleted && deletedIndexField
      ? await filterByNotDeleted(query, deletedIndexField).collect()
      : [];

  const idsNotDeleted = rowsNotDeleted.map((row) => row._id);

  const allIds = arrayIntersection(
    hasManyToManyFilter ? idsManyToManyFilters : null,
    hasOneToManyFilter ? idsOneToManyFilters : null,
    isIndexSearch ? idsIndexField : null,
    isSearchFieldSearch ? idsSearchField : null,
    args.query ? idsQuerySearch : null,
    softDeleteEnabled && !showDeleted ? idsNotDeleted : null
  );

  const idsToRemove = Array.from(
    new Set([
      ...idsManyToManyFiltersToRemove,
      ...idsOneToManyFiltersToRemove,
      ...idsSearchToRemove,
      ...idsIndexFieldToRemove,
    ])
  );

  const fetchLimit = args.displayOptions?.grouping?.field.name
    ? DEFAULT_MAX_ITEMS_GROUPING
    : DEFAULT_FETCH_LIMIT_QUERY;

  const position = args.paginateOptions?.cursor?.position ?? 0;
  const nextPosition = position + fetchLimit;

  const idsAfterRemove = allIds?.filter((id) => !idsToRemove.includes(id));

  const fetch = async (multiple?: number) => {
    const dbQuery = queryClient(ctx, viewConfigManager.getTableName());

    const getAll = () => {
      isGetAll = true;
      console.warn(
        'Querying complete table. Use Index or search index if possible.'
      );
      return dbQuery.collect();
    };

    const anyFilter = args.query || filtersWithoutIndexOrSearchField?.length;

    const rowsBeforeFilter = displayOptionsInfo.displaySortingIndexField
      ? await dbQuery
          .withIndex(
            displayOptionsInfo.displaySortingIndexField.name?.toString()
          )
          .order(displayOptionsInfo.sorting?.order ?? 'asc')
          .paginate({
            cursor: args?.paginateOptions?.cursor?.cursor ?? null,
            numItems: fetchLimit + (idsToRemove.length ?? 0),
          })
      : allIds !== null
      ? await getRecordsByIds(
          idsAfterRemove?.slice(position, nextPosition) ?? [],
          dbQuery
        )
      : anyFilter ||
        (displayOptionsInfo.hasSortingField &&
          !displayOptionsInfo.displaySortingIndexField)
      ? await getAll()
      : await dbQuery.paginate({
          cursor: args?.paginateOptions?.cursor?.cursor ?? null,
          numItems: fetchLimit + (idsToRemove.length ?? 0),
        });

    let rows =
      'page' in rowsBeforeFilter ? rowsBeforeFilter.page : rowsBeforeFilter;

    if (softDeleteEnabled && !showDeleted) {
      rows = rows.filter((row) => idsNotDeleted.includes(row._id));
    }

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

  const rows: ConvexRecordType[] = [];

  const newRows = await fetch();

  const filtered = newRows.filter(
    (r) =>
      !idsToRemove.includes(r._id) && !rows.map((r) => r._id).includes(r._id)
  );

  rows.push(...filtered);

  const rawData = await mapWithInclude(rows, ctx, args);

  let sortedRows = convexSortRows(
    rawData,
    args,
    displayOptionsInfo
  ) as ConvexRecordType[];

  sortedRows =
    allIds !== null ? sortedRows : sortedRows.slice(position, nextPosition);

  if (allIds !== null || isGetAll) {
    const newItemsLength = allIds !== null ? allIds.length : newRows.length;

    isDone = nextPosition >= newItemsLength;
    continueCursor.position = isDone ? position : nextPosition;
  }

  const data = parseConvexData(sortedRows);

  return { data, continueCursor, isDone, allIds };
};
