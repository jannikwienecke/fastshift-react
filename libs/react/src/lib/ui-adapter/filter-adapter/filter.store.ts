import { FieldConfig, FilterType, Row } from '@apps-next/core';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { operator } from './filter.operator';
import { filterUtil } from './filter.utils';

export type SelectFilterValueAction = {
  value: Row;
  field: FieldConfig;
};

export type FilterStore = {
  fitlers: FilterType[];
};

export const filterAtom = atom<FilterStore>({
  fitlers: [],
});

export const setFilterAtom = atom(
  null,
  (get, set, filter: SelectFilterValueAction) => {
    const filterState = get(filterAtom);
    let filters = filterState.fitlers;

    const exitingFilter = filters.find(
      (f) => f.field.name === filter.field.name
    );

    if (!exitingFilter) {
      filters.push(filterUtil().create(filter));
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
      return {
        ...f,
        operator: operator().value(f),
      };
    });

    const filtersWithValues = [
      ...filters.filter(
        (f) => !(f.type === 'relation' && f.values.length === 0)
      ),
    ];

    set(filterAtom, {
      ...filterState,
      fitlers: filtersWithValues,
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
