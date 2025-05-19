import {
  _log,
  arrayIntersection,
  BaseViewConfigManager,
  ContinueCursor,
  DEFAULT_FETCH_LIMIT_QUERY,
  DEFAULT_LOCAL_MODE_LIMIT,
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
import { getIdsFromParentView } from './convex-get-ids-from-parent-view';
import { mapWithInclude } from './convex-map-with-include';
import { convexSortRows } from './convex-sort-rows';
import { parseConvexData } from './convex-utils';
import { GenericQueryCtx } from './convex.server.types';
import { ConvexRecordType } from './types.convex';

export const getData = async (ctx: GenericQueryCtx, args: QueryServerProps) => {
  const { viewConfigManager, filters, registeredViews } = args;

  const softDeleteEnabled = !!viewConfigManager.viewConfig.mutation?.softDelete;

  const _indexFields = viewConfigManager.getIndexFields();

  const _searchFields = viewConfigManager.getSearchableFields();

  const displayField = viewConfigManager.getDisplayFieldLabel();

  const displayOptionsInfo = getDisplayOptionsInfo(args);

  const localModeEnabled =
    viewConfigManager.viewConfig.localMode?.enabled &&
    !args.viewId &&
    !args.parentId;

  const showDeleted = displayOptionsInfo.showDeleted || localModeEnabled;

  // debug('Convex:getData', {
  //   filters: filters?.length,
  //   displayField,
  //   displayOptionsInfo,
  //   localModeEnabled,
  //   showDeleted,
  // });

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

  const hasParentFilter = args.parentId && args.parentViewName;

  const idsSubView = hasParentFilter
    ? await getIdsFromParentView(args, ctx, viewConfigManager)
    : [];

  const deletedIndexField = viewConfigManager.getSoftDeleteIndexField();

  const query = queryClient(ctx, viewConfigManager.getTableName());

  const rowsNotDeleted =
    softDeleteEnabled && !showDeleted && deletedIndexField
      ? await filterByNotDeleted(query, deletedIndexField).collect()
      : [];

  const idsNotDeleted = hasParentFilter
    ? null
    : rowsNotDeleted.map((row) => row._id);

  let allIds = arrayIntersection(
    hasManyToManyFilter ? idsManyToManyFilters : null,
    hasOneToManyFilter ? idsOneToManyFilters : null,
    isIndexSearch ? idsIndexField : null,
    isSearchFieldSearch ? idsSearchField : null,
    args.query ? idsQuerySearch : null,
    softDeleteEnabled && !showDeleted && !hasParentFilter
      ? idsNotDeleted
      : null,
    hasParentFilter ? idsSubView : null
  );

  if (args.viewId) {
    allIds = [args.viewId];
  }

  const hasOnlyIdsNotDeleted =
    idsNotDeleted &&
    idsNotDeleted.length > 0 &&
    !idsManyToManyFilters.length &&
    !idsOneToManyFilters.length &&
    !idsIndexField.length &&
    !idsSearchField.length;

  const idsToRemove = Array.from(
    new Set([
      ...idsManyToManyFiltersToRemove,
      ...idsOneToManyFiltersToRemove,
      ...idsSearchToRemove,
      ...idsIndexFieldToRemove,
    ])
  );

  const fetchLimit = localModeEnabled
    ? DEFAULT_LOCAL_MODE_LIMIT
    : args.displayOptions?.grouping?.field.name
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
        `Querying complete table. Use Index or search index if possible. Table: ${viewConfigManager.getTableName()}`
      );
      return dbQuery.collect();
    };

    const anyFilter = args.query || filtersWithoutIndexOrSearchField?.length;

    const countToBig = idsAfterRemove?.length && idsAfterRemove.length > 500;

    if (countToBig) {
      _log.warn('Querying too many items.');
    }

    const getRecordsIfNotSortedAndNoDeletedRows = () => {
      return getRecordsByIds(
        idsAfterRemove?.slice(position, nextPosition) ?? [],
        dbQuery
      );
    };

    const getRecordsHasIdsAndNotTooBig = () => {
      return getRecordsByIds(idsAfterRemove ?? [], dbQuery);
    };

    const getSortedRecords = () => {
      if (!displayOptionsInfo.displaySortingIndexField) return [];

      return dbQuery
        .withIndex(displayOptionsInfo.displaySortingIndexField.name?.toString())
        .order(displayOptionsInfo.sorting?.order ?? 'asc')
        .paginate({
          cursor: args?.paginateOptions?.cursor?.cursor ?? null,
          numItems: fetchLimit + (idsToRemove.length ?? 0),
        });
    };

    const getPaginatedRecords = async () => {
      return await dbQuery.paginate({
        cursor: args?.paginateOptions?.cursor?.cursor ?? null,
        numItems: fetchLimit + (idsToRemove.length ?? 0),
      });
    };

    const rowsBeforeFilter =
      localModeEnabled && !allIds
        ? await getAll() // local mode
        : hasOnlyIdsNotDeleted && !displayOptionsInfo.displaySortingIndexField
        ? await getRecordsIfNotSortedAndNoDeletedRows()
        : !!allIds && !countToBig
        ? await getRecordsHasIdsAndNotTooBig()
        : displayOptionsInfo.displaySortingIndexField
        ? await getSortedRecords()
        : anyFilter ||
          (displayOptionsInfo.hasSortingField &&
            !displayOptionsInfo.displaySortingIndexField)
        ? await getAll()
        : await getPaginatedRecords();

    let rows =
      'page' in rowsBeforeFilter ? rowsBeforeFilter.page : rowsBeforeFilter;

    if (softDeleteEnabled && !showDeleted && !hasParentFilter) {
      rows = rows.filter((row) => idsNotDeleted?.includes(row?._id));
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

  if (localModeEnabled && newRows.length === DEFAULT_LOCAL_MODE_LIMIT) {
    _log.warn(
      `WARNING: Local Mode enabled and limit reached! Consider disabled local mode or addding a defautlt filter`
    );
  } else {
    // debug('Convex:fetchedRows.length', newRows.length);
  }

  const filtered = newRows?.filter(
    (r) =>
      !idsToRemove.includes(r?._id) && !rows.map((r) => r?._id).includes(r?._id)
  );

  rows.push(...filtered);

  let sortedRows = convexSortRows(
    // comment out -> we want to map with include later, check if this is ok
    // rawData,
    rows,
    args,
    displayOptionsInfo
  ) as ConvexRecordType[];

  sortedRows =
    allIds !== null
      ? // added this, before we returned all sortedRows
        sortedRows
      : sortedRows.slice(position, nextPosition);

  // need to be created because in the mapWithInclude - we override some values
  const postLoaderHook =
    args.viewConfigManager.viewConfig.loader?.postLoaderHook;

  sortedRows = await mapWithInclude(
    sortedRows.filter((r) => r !== null),
    ctx,
    {
      ...args,
      viewConfigManager: new BaseViewConfigManager(
        args.viewConfigManager.viewConfig
      ),
    }
  );

  if (allIds !== null || isGetAll) {
    const newItemsLength = allIds !== null ? allIds.length : newRows.length;

    isDone = nextPosition >= newItemsLength;
    continueCursor.position = isDone ? position : nextPosition;
  }

  let data = parseConvexData(sortedRows);

  if (allIds === null && data.length) {
    allIds = data.map((r) => r['id']);
  }

  if (postLoaderHook) {
    try {
      data = await postLoaderHook(ctx, args, data);
    } catch (error) {
      _log.error('Error in postLoaderHook', error);
      throw error;
    }
  }

  return { data, continueCursor, isDone, allIds };
};
