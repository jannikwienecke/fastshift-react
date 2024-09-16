import { FieldConfig, FilterType, Row } from '@apps-next/core';
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
              operator: {
                label: 'is',
              },
            }
          : {
              type: 'primitive',
              field: filter.field,
              value: filter.value,
              operator: {
                label: 'contains',
              },
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
      throw new Error('primitive filter not yet supported');
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

export const useFilter = () => {
  const setFilter = useSetAtom(setFilterAtom);
  const filter = useAtomValue(filterAtom);

  return {
    setFilter,
    filter,
  };
};
