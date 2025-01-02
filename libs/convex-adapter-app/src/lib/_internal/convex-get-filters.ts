import { FilterType, IndexField, SearchableField } from '@apps-next/core';
import { filterUtil, dateUtils } from '@apps-next/react';

export type SearchField = {
  field: string | symbol | number;
  name: string;
};

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

export const getFiltersWithIndexOrSearchField = (
  filters: FilterType[],
  searchFields: SearchField[] | undefined
) => {
  return filters.filter((f) =>
    searchFields?.find((s) => s.field === f.field.name)
  );
};

export const getEnumFilters = (filters: FilterType[]) =>
  filters.filter((f) => f.type === 'relation' && f.field.enum);

export const getHasOneToManyFilter = (filters: FilterType[]) => {
  const xx = getRelationalFilters(filters).find(
    (f) => f.operator.label === 'is' || f.operator.label === 'is any of'
  )
    ? true
    : false;

  return xx;
};

export const getHasManyToManyFilter = (filters: FilterType[]) =>
  getManyToManyFilters(filters).find(
    (f) => f.operator.label === 'is' || f.operator.label === 'is any of'
  )
    ? true
    : false;

export const getStringFilters = (filters: FilterType[]) =>
  filters.filter((f) => f.field.type === 'String');

export const getDateFilters = (filters: FilterType[]) =>
  filters.filter((f) => f.field.type === 'Date');

export const getFilterTypes = (
  filtersUnparsed: FilterType[] | undefined,
  _searchFields: SearchableField[] | undefined,
  _indexFields: IndexField[] | undefined
) => {
  if (!filtersUnparsed)
    return {
      primitiveFilters: [],
      oneToManyFilters: [],
      manyToManyFilters: [],
      filterWithSearchField: undefined,
      enumFilters: [],
      hasOneToManyFilter: false,
      hasManyToManyFilter: false,
      stringFilters: [],
      dateFilters: [],
    };

  const filters = [...filtersUnparsed].map((f) => {
    if (f.field.type === 'Date') {
      const date = dateUtils.parseOption(filterUtil().getValue(f), f.operator);
      return {
        ...f,
        date,
      };
    }
    return f;
  });

  const indexFields = _indexFields
    ?.filter((f) => f.fields.length === 1)
    .map((f) => ({
      name: f.name,
      field: f.fields[0]?.toString() ?? '',
    }));

  const searchFields = _searchFields?.map((f) => ({
    name: f.name,
    field: f.field.toString(),
  }));

  const filtersWithSearchField = getFiltersWithIndexOrSearchField(
    filters,
    searchFields
  );
  const filtersWithIndexField = getFiltersWithIndexOrSearchField(
    filters,
    indexFields
  );

  const dateFilters = getDateFilters(filters);

  // remove all filter that are either in searchFields or indexFields
  const _filters = filters.filter(
    (f) =>
      !searchFields?.find((s) => s.field === f.field.name) &&
      !indexFields?.find((i) => i.field === f.field.name)
  );

  return {
    filtersWithoutIndexOrSearchField: _filters.filter(
      (f) => !indexFields?.find((i) => i.field === f.field.relation?.fieldName)
    ),
    filtersWithIndexField,
    filtersWithSearchField,
    indexFields,
    searchFields,
    dateFilters,
    primitiveFilters: getPrimitiveFilters(_filters),
    oneToManyFilters: getRelationalFilters(_filters),
    manyToManyFilters: getManyToManyFilters(_filters),
    enumFilters: getEnumFilters(_filters),
    hasOneToManyFilter: getHasOneToManyFilter(_filters),
    hasManyToManyFilter: getHasManyToManyFilter(_filters),
    stringFilters: getStringFilters(_filters),
  };
};
