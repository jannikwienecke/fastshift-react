import { FilterType } from '@apps-next/core';
import { filterUtil } from '@apps-next/react';
import { SearchField } from './convex-get-filters';
import { ConvexRecord } from './types.convex';

export const filterResults = (
  rows: ConvexRecord[],
  filterField: string,
  query?: string,
  filters?: FilterType[],
  searchFields?: SearchField[]
) => {
  const enumFilters = filters?.filter((f) => f.field.enum) ?? [];
  const stringFilters = filters?.filter((f) => f.field.type === 'String') ?? [];
  const equalityFilters =
    filters?.filter(
      (f) => f.field.type === 'Boolean' || f.field.type === 'Number'
    ) ?? [];

  const filterByQuery = (row: ConvexRecord) => {
    if (!query) return true;
    if (!searchFields?.length) return true;

    const value = row[filterField].toLowerCase();
    return value.includes(query?.toLowerCase() ?? '');
  };

  const filterByStringFilters = (row: ConvexRecord) => {
    if (!stringFilters.length) return true;

    return stringFilters.every((filter) => {
      const value = row[filter.field.name]?.toLowerCase() ?? '';
      const valueOfFilter = filterUtil().getValue(filter)?.toLowerCase() ?? '';
      if (!valueOfFilter) return true;
      const contains = filter.operator.label === 'contains';

      if (contains) {
        return value?.includes(valueOfFilter.toLowerCase());
      } else {
        return !value?.includes(valueOfFilter.toLowerCase());
      }
    });
  };

  const filterByNumberAndBooleanFilters = (row: ConvexRecord) => {
    if (!equalityFilters.length) return true;

    return equalityFilters.every((filter) => {
      const value = row[filter.field.name];
      const valueOfFilter = filterUtil().getValue(filter).toLowerCase();
      if (!valueOfFilter) return true;
      const is = filter.operator.label === 'is';
      if (is) {
        return String(value).toLowerCase() === valueOfFilter;
      } else {
        return !String(value).toLowerCase().includes(valueOfFilter);
      }
    });
  };

  const filterEnumFilters = (row: ConvexRecord) => {
    if (!enumFilters.length) return true;
    return enumFilters.every((filter) => {
      const value = row[filter.field.name];
      const is =
        filter.operator.label === 'is' || filter.operator.label === 'is any of';

      const valuesOfFilter = filterUtil().getValues(filter);
      if (!valuesOfFilter.length) return true;

      if (is) {
        return valuesOfFilter.some(
          (v) => v.raw.toLowerCase() === value.toLowerCase()
        );
      } else {
        return valuesOfFilter.every(
          (v) => !value.toLowerCase().includes(v.raw.toLowerCase())
        );
      }
    });
  };

  return rows.filter((row) => {
    const x = filterByNumberAndBooleanFilters(row);
    const y = filterByStringFilters(row);
    const z = filterByQuery(row);
    const w = filterEnumFilters(row);

    return x && y && z && w;
  });
};
