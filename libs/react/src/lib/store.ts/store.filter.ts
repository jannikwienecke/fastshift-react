import {
  FieldConfig,
  FieldType,
  FilterOperatorTypePrimitive,
  FilterOperatorTypeRelation,
  FilterType,
  Row,
} from '@apps-next/core';
import { atom, useAtomValue, useSetAtom } from 'jotai';

type SelectFilterValueAction = {
  value: Row;
  field: FieldConfig;
};

export type FilterStore = {
  fitlers: FilterType[];
};

export const filterAtom = atom<FilterStore>({
  fitlers: [],
});

const isRelation = (field: FieldConfig) => {
  return (
    field.type === 'Reference' ||
    field.type === 'OneToOneReference' ||
    field.type === 'Union' ||
    field.type === 'Enum'
  );
};

const DEFAULT_OPERATOR = {
  label: 'is',
} as const;

export const DEFAULT_OPERATOR_PRIMITIVE: Partial<{
  [key in FieldType]: FilterOperatorTypePrimitive;
}> = {
  Boolean: DEFAULT_OPERATOR,
  String: {
    label: 'contains',
  },
  Number: DEFAULT_OPERATOR,
  Enum: DEFAULT_OPERATOR,
  Date: DEFAULT_OPERATOR,
};

export const DEFAULT_OPERATOR_RELATION: Partial<{
  [key in FieldType]: FilterOperatorTypeRelation;
}> = {
  Enum: DEFAULT_OPERATOR,
  Reference: DEFAULT_OPERATOR,
  OneToOneReference: DEFAULT_OPERATOR,
  Union: DEFAULT_OPERATOR,
};

export const setFilterAtom = atom(
  null,
  (get, set, filter: SelectFilterValueAction) => {
    const filterState = get(filterAtom);
    let filters = filterState.fitlers;

    const exitingFilter = filters.find(
      (f) => f.field.name === filter.field.name
    );

    if (!exitingFilter) {
      filters.push(
        isRelation(filter.field)
          ? {
              type: 'relation',
              field: filter.field,
              values: [filter.value],
              operator:
                DEFAULT_OPERATOR_RELATION[filter.field.type] ??
                DEFAULT_OPERATOR,
            }
          : {
              type: 'primitive',
              field: filter.field,
              value: filter.value,
              operator:
                DEFAULT_OPERATOR_PRIMITIVE[filter.field.type] ??
                DEFAULT_OPERATOR,
            }
      );
    }

    if (exitingFilter && exitingFilter.type === 'relation') {
      const exitingValue = exitingFilter.values.find(
        (v) => v.id === filter.value.id
      );

      if (exitingValue) {
        exitingFilter.values = exitingFilter.values.filter(
          (v) => v.id !== filter.value.id
        );

        if (exitingFilter.values.length === 0) {
          filters = filters.filter((f) => f.field.name !== filter.field.name);
        }
      } else {
        exitingFilter.values.push(filter.value);
      }
    } else if (exitingFilter && exitingFilter.type === 'primitive') {
      exitingFilter.value = filter.value;
    }

    filters = filterState.fitlers.map((f) => {
      if (f.type === 'relation') {
        const hasMoreThanOneValue = f.values.length > 1;
        return {
          ...f,
          operator: {
            label: hasMoreThanOneValue ? 'is any of' : 'is',
          },
        };
      }
      return f;
    });

    set(filterAtom, {
      ...filterState,
      fitlers: filters,
    });
  }
);

export const removeFilterAtom = atom(null, (get, set, filter: FilterType) => {
  const filters = get(filterAtom).fitlers;
  const newFilters = filters.filter((f) => f.field.name !== filter.field.name);
  set(filterAtom, {
    ...get(filterAtom),
    fitlers: newFilters,
  });
});

export const useFilterStore = () => {
  const setFilter = useSetAtom(setFilterAtom);
  const removeFilter = useSetAtom(removeFilterAtom);
  const filter = useAtomValue(filterAtom);

  return {
    setFilter,
    removeFilter,
    filter,
  };
};
