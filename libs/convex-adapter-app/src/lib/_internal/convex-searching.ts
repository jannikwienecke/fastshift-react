import { FilterType, ID, SearchableField } from '@apps-next/core';
import { ConvexClient } from './types.convex';

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
