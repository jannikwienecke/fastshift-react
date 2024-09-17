import { FilterType, SearchableField } from '@apps-next/core';
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
    _query = dbQuery.filter((q) => {
      const _value =
        filter.field.type === 'Boolean'
          ? value?.raw === 'false'
            ? false
            : true
          : filter.field.type === 'Number'
          ? Number(value?.raw)
          : value?.raw;

      return q.eq(q.field(filter.field.name), _value);
    });
  });

  return _query;
};

export const withEnumFilters = (
  enumFilters: FilterType[],
  dbQuery: ConvexClient[string]
) => {
  const filter = enumFilters?.[0];
  if (!filter) return dbQuery;

  const values = filter.type === 'relation' ? filter.values : [filter.value];

  return dbQuery.filter((q) =>
    q.or(...values.map((value) => q.eq(q.field(filter.field.name), value.raw)))
  );
};
