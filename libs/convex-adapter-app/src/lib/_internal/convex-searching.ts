import { FilterType } from '@apps-next/core';
import { isEnumNegateOperator } from '@apps-next/react';
import { asyncMap } from 'convex-helpers';
import { SearchField } from './convex-get-filters';
import { queryBuilder } from './convex-operators';
import {
  ConvexClient,
  ConvexRecord,
  SearchFilterBuilder,
} from './types.convex';

export const withSearch = async (
  dbQuery: ConvexClient[string],
  {
    searchFields,
    query,
    rowIdsNotDeleted,
  }: {
    searchFields: SearchField[];
    query: string;
    rowIdsNotDeleted: string[];
  }
): Promise<ConvexRecord[]> => {
  const rowsList = await asyncMap(searchFields, async (searchField) => {
    const rows = await dbQuery
      .withSearchIndex(searchField.name, (q) =>
        q.search(searchField.field.toString(), query ?? '')
      )
      .collect();

    return rows;
  });

  const rows = rowsList.flat();
  const uniqueIds = [...new Set(rows.map((r) => r._id))].filter((id) =>
    rowIdsNotDeleted.includes(id)
  );

  return uniqueIds
    .map((id) => rows.find((r) => r._id === id))
    .filter((r) => r !== undefined);
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
