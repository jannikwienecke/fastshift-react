import { FilterType, SearchableField } from '@apps-next/core';

export const getManyToManyFilters = (filters: FilterType[]) =>
  filters?.filter((f) => f.field.relation?.manyToManyTable) ?? [];

export const getRelationalFilters = (filters: FilterType[]) =>
  filters?.filter(
    (f) =>
      f.type === 'relation' &&
      !f.field.relation?.manyToManyTable &&
      !f.field.enum
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

export const getEnumFilters = (filters: FilterType[]) =>
  filters.filter((f) => f.type === 'relation' && f.field.enum);

export const getFilterTypes = (
  filters: FilterType[] | undefined,
  searchField: SearchableField | undefined
) => {
  if (!filters)
    return {
      primitiveFilters: [],
      oneToManyFilters: [],
      manyToManyFilters: [],
      filterWithSearchField: undefined,
      enumFilters: [],
    };

  return {
    primitiveFilters: getPrimitiveFilters(filters),
    oneToManyFilters: getRelationalFilters(filters),
    manyToManyFilters: getManyToManyFilters(filters),
    filterWithSearchField: getFilterWithSearchField(filters, searchField),
    enumFilters: getEnumFilters(filters),
  };
};
