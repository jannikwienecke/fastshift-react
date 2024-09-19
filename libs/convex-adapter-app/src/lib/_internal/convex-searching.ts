import { FilterType, SearchableField } from '@apps-next/core';
import { isEnumNegateOperator } from '@apps-next/react';
import { queryBuilder } from './convex-operators';
import { ConvexClient, SearchFilterBuilder } from './types.convex';

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

      return queryBuilder(q, filter.operator)(
        q.field(filter.field.name),
        _value
      );
    });
  });

  return _query;
};

export const withEnumFilters = (
  enumFilters: FilterType[],
  dbQuery: ConvexClient[string]
) => {
  let _dbQuery = dbQuery;

  enumFilters.forEach((filter) => {
    const values = filter.type === 'relation' ? filter.values : [filter.value];

    const _andOr = (q: SearchFilterBuilder, filter: FilterType) =>
      isEnumNegateOperator(filter.operator) ? q.and : q.or;

    _dbQuery = dbQuery.filter((q) =>
      _andOr(
        q,
        filter
      )(
        ...values.map((value) =>
          queryBuilder(q, filter.operator)(
            q.field(filter.field.name),
            value.raw
          )
        )
      )
    );
  });

  return _dbQuery;
};
