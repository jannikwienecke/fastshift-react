import { ComboxboxItem, FieldConfig, RegisteredViews } from '@apps-next/core';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { getViewConfigAtom } from '../../stores';
import { operator } from './filter.operator';
import { filterUtil } from './filter.utils';
import { filterAtom } from './filter.store';

type FilterState = {
  query: string;
  values: ComboxboxItem[];
  open: boolean;
  tableName: string;
  id: string | null;
  registeredViews: RegisteredViews;
  selectedField: FieldConfig | null;
  rect: DOMRect | null;
  selectedOperatorField: FieldConfig | null;
};

const DEFAULT_FILTER_STATE: FilterState = {
  query: '',
  values: [],
  open: false,
  tableName: '',
  id: null,
  registeredViews: {},
  selectedField: null,
  rect: null,
  selectedOperatorField: null,
};

export const filterStateAtom = atom<FilterState>(DEFAULT_FILTER_STATE);

export const openFilterAtom = atom(false, (get, set, open: boolean) => {
  const viewConfigManager = get(getViewConfigAtom);
  const viewFields = viewConfigManager.getViewFieldList();

  const values = viewFields.map((field) => {
    return {
      id: field.name,
      label: field.name,
    };
  });

  set(filterStateAtom, { ...get(filterStateAtom), open, values });
});

export const selectFilterAtom = atom(null, (get, set, value: ComboxboxItem) => {
  const state = get(filterStateAtom);
  const { selectedOperatorField } = state;
  if (selectedOperatorField) {
    const filterStore = get(filterAtom);

    const updatedFilters = filterStore.fitlers.map((f) => {
      if (f.field.name === selectedOperatorField.name) {
        return filterUtil().update(f, value);
      }
      return f;
    });

    set(filterAtom, { ...filterStore, fitlers: updatedFilters });
  } else {
    const viewConfigManager = get(getViewConfigAtom);
    const field = viewConfigManager.getFieldBy(value.id.toString());

    set(filterStateAtom, { ...get(filterStateAtom), selectedField: field });
  }
});

export const closeFieldOptionsFilterAtom = atom(null, (get, set) => {
  set(filterStateAtom, {
    ...get(filterStateAtom),
    open: false,
    selectedOperatorField: null,
    values: [],
  });
});

export const closeAllFilterAtom = atom(null, (get, set) => {
  set(filterStateAtom, { ...get(filterStateAtom), ...DEFAULT_FILTER_STATE });
});

const setPositionAtom = atom(null, (get, set, rect: DOMRect) => {
  set(filterStateAtom, { ...get(filterStateAtom), rect });
});

export const openOperatorOptionsFilterAtom = atom(
  null,
  (get, set, field: FieldConfig) => {
    const filterStore = get(filterAtom);
    const currentFilter = filterStore.fitlers?.find(
      (f) => f.field.name === field.name
    );

    const options = operator().makeOptionsFrom(field, currentFilter);

    set(filterStateAtom, {
      ...get(filterStateAtom),
      values: options,
      open: true,
      selectedOperatorField: field,
    });
  }
);

export const useFiltering = () => {
  const filterState = useAtomValue(filterStateAtom);
  const open = useSetAtom(openFilterAtom);
  const select = useSetAtom(selectFilterAtom);
  const closeFieldOptions = useSetAtom(closeFieldOptionsFilterAtom);
  const setPosition = useSetAtom(setPositionAtom);
  const openOperatorOptions = useSetAtom(openOperatorOptionsFilterAtom);
  const closeAll = useSetAtom(closeAllFilterAtom);
  return {
    filterState,
    open,
    select,
    closeFieldOptions,
    setPosition,
    openOperatorOptions,
    closeAll,
  };
};
