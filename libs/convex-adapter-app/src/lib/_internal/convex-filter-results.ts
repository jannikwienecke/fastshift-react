import { SearchableField, FilterType } from '@apps-next/core';
import { ConvexRecord } from './types.convex';

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
