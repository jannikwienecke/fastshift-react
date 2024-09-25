import { FieldConfig, FilterType, makeRow, Row } from '@apps-next/core';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { operator } from './filter.operator';
import { filterUtil } from './filter.utils';
import { filterStateAtom, useFiltering } from './filter.state';
import { UseComboboxProps } from '../combox-adapter';
import { InputDialogValueDict } from '../input-dialog';

export type SelectFilterValueAction = {
  value: Row;
  field: FieldConfig;
};

export type FilterStore = {
  filters: FilterType[];
};

export const filterAtom = atom<FilterStore>({
  filters: [],
});

export const setFilterAtom = atom(
  null,
  (get, set, filter: SelectFilterValueAction) => {
    const filterState = get(filterAtom);
    let filters = filterState.filters;

    const exitingFilter = filters.find(
      (f) => f.field.name === filter.field.name
    );

    if (!exitingFilter) {
      filters.push(filterUtil().create(filter));
      set(filterAtom, {
        ...filterState,
        filters,
      });
      return;
    }

    if (exitingFilter.type === 'relation') {
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

      // remove filters without values and update operator
      filters = filters
        .filter((f) => !(f.type === 'relation' && f.values.length === 0))
        .map((f) => {
          return {
            ...f,
            operator: operator().value(f),
          };
        });
    } else if (exitingFilter.type === 'primitive') {
      const newFilter = filterUtil().create(filter);

      exitingFilter.value = newFilter.value;
      exitingFilter.operator = newFilter.operator;
    }

    set(filterAtom, {
      ...filterState,
      filters,
    });
  }
);

export const removeFilterAtom = atom(null, (get, set, filter: FilterType) => {
  const filters = get(filterAtom).filters;
  const newFilters = filters.filter((f) => f.field.name !== filter.field.name);
  set(filterAtom, {
    ...get(filterAtom),
    filters: newFilters,
  });
});

const selectedFilterAtom = atom((get) => {
  const getSelected = () => {
    const filter = get(filterAtom);
    const filterState = get(filterStateAtom);

    const activeFilter = filter.filters.find(
      (f) => f.field.name === filterState.selectedField?.name
    );

    if (!activeFilter) return [];

    const values =
      activeFilter?.type === 'relation'
        ? activeFilter.values
        : [activeFilter?.value];

    return values;
  };

  return getSelected();
});

const handleSelectValueAtom = atom(null, (get, set, value: Row) => {
  const filterState = get(filterStateAtom);

  if (!filterState.selectedField) return;
  set(setFilterAtom, {
    field: filterState.selectedField,
    value,
  });
});

const handleEnterValueAtom = atom(
  null,
  (get, set, props: InputDialogValueDict) => {
    const { field, value } = Object.values(props)?.[0] ?? {};
    if (!field || !value) return;

    set(filterStateAtom, {
      ...get(filterStateAtom),
      selectedField: null,
      open: false,
      rect: null,
    });

    set(setFilterAtom, {
      value: makeRow(value, value, value, field),
      field,
    });
  }
);

export const useFilterStore = () => {
  const props = useFiltering();

  const setFilter = useSetAtom(setFilterAtom);
  const removeFilter = useSetAtom(removeFilterAtom);
  const filter = useAtomValue(filterAtom);
  const selected = useAtomValue(selectedFilterAtom);
  const handleSelectValue = useSetAtom(handleSelectValueAtom);

  const handleEnterValueFromInputDialog = useSetAtom(handleEnterValueAtom);

  const activeFilter = filter.filters.find(
    (f) => f.field.name === props.filterState.selectedField?.name
  );

  const activeFilterValue =
    activeFilter?.type === 'primitive' ? activeFilter.value.raw : undefined;

  return {
    setFilter,
    activeFilterValue,
    activeFilter,
    removeFilter,
    filter,
    selected,
    handleSelectValue,
    handleEnterValueFromInputDialog,
    propsForCombobox: {
      field: props.filterState.selectedField,
      rect: props.filterState.rect ?? ({} as DOMRect),
      selected,
      multiple: true,
    } satisfies UseComboboxProps['state'],
    ...props,
  };
};
