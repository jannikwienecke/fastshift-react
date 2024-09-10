import { SearchableField } from '@apps-next/core';
import { ConvexClient } from './types.convex';

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
  if (!query || !searchField) return dbQuery;

  return dbQuery.withSearchIndex(searchField?.name, (q) =>
    q.search(searchField.field.toString(), query)
  );
};
