import { SearchableField } from '@apps-next/core';
import { ConvexClient, ConvexRecord } from './types.convex';

export const withSearch = (
  dbQuery: ConvexClient[string],
  {
    searchField,
    query,
  }: {
    searchField?: SearchableField;
    query?: string;
  }
) => {
  if (!searchField) return dbQuery.order('desc');

  if (!query) return dbQuery.order('desc');

  return dbQuery.withSearchIndex(searchField?.name, (q) =>
    q.search(searchField.field.toString(), query ?? '')
  );
};

export const filterResults = (
  rows: ConvexRecord[],
  filterField: string,
  query?: string,
  searchField?: SearchableField
) => {
  if (searchField?.field) return rows;
  if (!query) return rows;

  return rows.filter((row) =>
    row[filterField].toLowerCase().includes(query.toLowerCase())
  );
};
