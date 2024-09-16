import {
  BaseViewConfigManagerInterface,
  DEFAULT_FETCH_LIMIT_QUERY,
  FilterType,
  ID,
  SearchableField,
} from '@apps-next/core';
import { ConvexClient, ConvexRecord } from './types.convex';
import { asyncMap } from 'convex-helpers';
import { queryClient } from './convex-client';
import { GenericQueryCtx } from './convex.server.types';

export const withSearch = (
  dbQuery: ConvexClient[string],
  {
    searchField,
    query,
    filterWithSearch,
  }: {
    searchField?: SearchableField;
    query?: string;
    filterWithSearch?: FilterType;
  }
): ConvexClient[string] => {
  if ((!searchField || !query) && !filterWithSearch) return dbQuery;
  // if (!searchField) return dbQuery.order('desc');

  // if (!query) return dbQuery.order('desc');

  if (!searchField) return dbQuery;
  if (query) {
    if (!searchField) return dbQuery;

    return dbQuery.withSearchIndex(searchField.name, (q) =>
      q.search(searchField.field.toString(), query ?? '')
    );
  }

  const value =
    filterWithSearch?.type === 'primitive' ? filterWithSearch.value.raw : '';
  if (!value) return dbQuery;

  return dbQuery.withSearchIndex(searchField.name, (q) =>
    q.search(searchField.field.toString(), value)
  );
};

export const withModelIds = (ids: ID[], dbQuery: ConvexClient[string]) => {
  if (ids.length === 0) return dbQuery;

  return dbQuery.filter((q) =>
    q.or(...ids.map((id) => q.eq(q.field('_id'), id)))
  );
};

export const withPrimitiveFilters = (
  primitiveFilters: FilterType[],
  dbQuery: ConvexClient[string]
) => {
  let _query = dbQuery;
  primitiveFilters.forEach((filter) => {
    const value = filter.type === 'primitive' ? filter.value : null;
    _query = dbQuery.filter((q) =>
      q.eq(q.field(filter.field.name), value?.raw)
    );
  });

  return _query;
};

export const filterResults = (
  rows: ConvexRecord[],
  filterField: string,
  query?: string,
  searchField?: SearchableField,
  stringFilters?: FilterType[]
) => {
  return rows.filter((row) => {
    const value = row[filterField].toLowerCase();
    let includesQuery = value.includes(query?.toLowerCase() ?? '');

    if (!stringFilters) {
      if (searchField) return true;
      if (query) return includesQuery;
      return true;
    }

    if (!query || searchField) {
      includesQuery = true;
    }

    const hasAllStringFilters = stringFilters
      .filter((f) => searchField?.field !== f.field.name)
      .every((filter) => {
        const stringFilterValue =
          filter.type === 'primitive' ? filter.value.raw : null;
        if (!stringFilterValue) return true;

        const valueOfField = row[filter.field.name]?.toLowerCase();
        if (!valueOfField) return false;

        return valueOfField?.includes(stringFilterValue);
      });

    return includesQuery && hasAllStringFilters;
  });
};

/*
  Get records by ids
  @param ids
  @param dbQuery
  @returns
*/
export const getRecordsByIds = async (
  ids: ID[],
  dbQuery: ConvexClient[string]
) => {
  return await asyncMap(ids.slice(0, DEFAULT_FETCH_LIMIT_QUERY), async (id) => {
    return await dbQuery.withIndex('by_id', (q) => q.eq('_id', id)).first();
  });
};

/**
 * Get ids from many to many filters
 * E.g.: On the view Task, we filter by one or more tags.
 * -> We want all tasks that have at least one of the tags.
 * @param manyToManyFilters
 * @param ctx - Convex context
 * @returns
 */
export const getIdsFromManyToManyFilters = async (
  manyToManyFilters: FilterType[],
  ctx: GenericQueryCtx,
  viewConfigManager: BaseViewConfigManagerInterface
): Promise<ID[]> => {
  const idsLists = await asyncMap(manyToManyFilters, async (filter) => {
    // e.g.: at TaskView -> tagId
    const fieldNameFilter =
      filter?.field.relation?.manyToManyModelFields?.find(
        (f) => f.name === filter.field.name
      )?.relation?.fieldName ?? '';

    // e.g.: at TaskView -> taskId
    const fieldNameView =
      filter?.field.relation?.manyToManyModelFields?.find(
        (f) => f.name === viewConfigManager.getTableName()
      )?.relation?.fieldName ?? '';

    // e.g: TaskTag
    const manyToManyTable = filter?.field.relation?.manyToManyTable ?? '';
    // e.g.: ['tagId']
    const values = filter?.type === 'relation' ? filter.values : [];

    const idLists = await asyncMap(values, async (value) => {
      if (!manyToManyTable || !fieldNameFilter) return null;

      return (
        await queryClient(ctx, manyToManyTable)
          .withIndex(fieldNameFilter, (q) => q.eq(fieldNameFilter, value.id))
          .collect()
      )?.map((manyToManyRow) => manyToManyRow[fieldNameView]);
    });

    const ids = idLists.filter((id) => id !== null).flat() as ID[];

    return [...new Set(ids)];
  });

  return [...new Set(idsLists.flat())];
};

/**
 * Get ids from one to many filters
 * E.g.: On the view Task, we filter by one or more projects.
 * -> We want all tasks that have at least one of the projects.
 * @param manyToManyFilters
 * @param ctx - Convex context
 * @returns
 */
export const getIdsFromOneToManyFilters = async (
  relationalFilters: FilterType[],
  ctx: GenericQueryCtx,
  viewConfigManager: BaseViewConfigManagerInterface
) => {
  const tableName = viewConfigManager.getTableName();

  const listOfIds = await asyncMap(relationalFilters ?? [], async (filter) => {
    const values = filter.type === 'relation' ? filter.values : [];

    // e.g.: at TaskView -> projectId
    const fieldName = filter.field.relation?.fieldName;
    if (!fieldName) return [];

    const mapped = await asyncMap(values, async (row) => {
      const id = row.id;
      if (!id) return null;

      const tasks = await queryClient(ctx, tableName)
        .withIndex(fieldName, (q) => q.eq(fieldName, id))
        .collect();

      return tasks.map((task) => task._id);
    });

    const ids = mapped
      .filter((a) => a !== null)
      .filter((a) => a !== undefined)
      .flat();

    return ids as ID[];
  });

  return [...new Set(listOfIds.flat())];
};

export const getManyToManyFilters = (filters: FilterType[]) =>
  filters?.filter((f) => f.field.relation?.manyToManyTable) ?? [];

export const getRelationalFilters = (filters: FilterType[]) =>
  filters?.filter(
    (f) => f.type === 'relation' && !f.field.relation?.manyToManyTable
  ) ?? [];

export const getPrimitiveFilters = (filters: FilterType[]) =>
  filters.filter(
    (f) =>
      f.type === 'primitive' &&
      (f.field.type === 'Boolean' || f.field.type === 'Number')
  );

export const getFilterWithSearchField = (
  filters: FilterType[],
  searchField: SearchableField | undefined
) => filters.find((f) => searchField?.field === f.field.name);

export const getFilterTypes = (
  filters: FilterType[],
  searchField: SearchableField | undefined
) => {
  return {
    primitiveFilters: getPrimitiveFilters(filters),
    oneToManyFilters: getRelationalFilters(filters),
    manyToManyFilters: getManyToManyFilters(filters),
    filterWithSearchField: getFilterWithSearchField(filters, searchField),
  };
};
