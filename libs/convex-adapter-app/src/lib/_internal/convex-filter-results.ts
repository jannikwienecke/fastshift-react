import { FilterType } from '@apps-next/core';
import { ConvexRecord } from './types.convex';
import { SearchField } from './convex-get-filters';

export const filterResults = (
  rows: ConvexRecord[],
  filterField: string,
  query?: string,
  stringFilters?: FilterType[],
  searchFields?: SearchField[]
) => {
  return rows.filter((row) => {
    const value = row[filterField].toLowerCase();
    let includesQuery = searchFields?.length
      ? true
      : value.includes(query?.toLowerCase() ?? '');

    if (!stringFilters) {
      if (query) return includesQuery;
      return true;
    }

    if (!query) {
      includesQuery = true;
    }

    const hasAllStringFilters = stringFilters.every((filter) => {
      const stringFilterValue =
        filter.type === 'primitive' ? filter.value.raw : null;
      if (!stringFilterValue) return true;

      const valueOfField = row[filter.field.name]?.toLowerCase();
      if (!valueOfField) return false;

      return valueOfField?.includes(stringFilterValue.toLowerCase());
    });

    return includesQuery && hasAllStringFilters;
  });
};
