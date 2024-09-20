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

export const getHasOneToManyFilter = (filters: FilterType[]) =>
  getRelationalFilters(filters).find(
    (f) => f.operator.label === 'is' || f.operator.label === 'is any of'
  )
    ? true
    : false;

export const getHasManyToManyFilter = (filters: FilterType[]) =>
  getManyToManyFilters(filters).find(
    (f) => f.operator.label === 'is' || f.operator.label === 'is any of'
  )
    ? true
    : false;

export const getStringFilters = (
  filters: FilterType[],
  searchField: SearchableField | undefined
) =>
  filters
    .filter((f) => f.field.type === 'String')
    .filter((f) => f.field.name !== searchField?.field);

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
      hasOneToManyFilter: false,
      hasManyToManyFilter: false,
      stringFilters: [],
    };

  const filterWithSearchField = getFilterWithSearchField(filters, searchField);

  const _filters = filters.filter((f) => f.field.name !== searchField?.field);

  return {
    filterWithSearchField,
    primitiveFilters: getPrimitiveFilters(_filters),
    oneToManyFilters: getRelationalFilters(_filters),
    manyToManyFilters: getManyToManyFilters(_filters),
    enumFilters: getEnumFilters(filters),
    hasOneToManyFilter: getHasOneToManyFilter(filters),
    hasManyToManyFilter: getHasManyToManyFilter(filters),
    stringFilters: getStringFilters(_filters, searchField),
  };
};
