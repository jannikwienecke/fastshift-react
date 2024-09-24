import {
  ComboxboxItem,
  FieldConfig,
  makeRow,
  RegisteredViews,
} from '@apps-next/core';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { getViewConfigAtom } from '../../stores';
import { operator } from './filter.operator';
import { filterUtil } from './filter.utils';
import { filterAtom, setFilterAtom } from './filter.store';
import { dateUtils } from './date.utils';

type FilterState = {
  query: string;
  values: ComboxboxItem[];
  filteredValues: ComboxboxItem[];
  open: boolean;
  tableName: string;
  id: string | null;
  registeredViews: RegisteredViews;
  selectedField: FieldConfig | null;
  rect: DOMRect | null;
  selectedOperatorField: FieldConfig | null;
  selectedDateField: FieldConfig | null;
  showDatePicker: boolean;
};

const DEFAULT_FILTER_STATE: FilterState = {
  query: '',
  values: [],
  filteredValues: [],
  open: false,
  tableName: '',
  id: null,
  registeredViews: {},
  selectedField: null,
  rect: null,
  selectedOperatorField: null,
  showDatePicker: false,
  selectedDateField: null,
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

  if (state.selectedDateField) {
    console.log('selectedDateField', value);
    if (value.id === 'Select specific date') {
      set(filterStateAtom, { ...get(filterStateAtom), showDatePicker: true });
    } else {
      set(setFilterAtom, {
        field: state.selectedDateField,
        value: makeRow(
          value.id.toString(),
          value.id.toString(),
          value.id,
          state.selectedDateField
        ),
      });
      // TODO: HIER WEITER MACHEN
      // handle what happens when the user selects a date
      // also handle case to change the operator of the filter
      // handle all backend logic for date filters
      // handle case when select from the date picker....
    }
  } else if (selectedOperatorField) {
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

    if (field.type === 'Date') {
      const options = dateUtils.getOptions('');
      set(filterStateAtom, {
        ...get(filterStateAtom),
        open: true,
        values: options,
        selectedField: field,
        selectedDateField: field,
      });
    } else {
      set(filterStateAtom, {
        ...get(filterStateAtom),
        selectedField: field,
        open: false,
        selectedOperatorField: null,
        values: [],
        rect: null,
      });
    }
  }
});

export const closeFieldOptionsFilterAtom = atom(null, (get, set) => {
  set(filterStateAtom, {
    ...get(filterStateAtom),
    open: false,
    selectedOperatorField: null,
    selectedDateField: null,
    showDatePicker: false,
    values: [],
    rect: null,
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

export const setQueryAtom = atom(null, (get, set, query: string) => {
  const { values, selectedDateField } = get(filterStateAtom);

  if (selectedDateField) {
    const options = dateUtils.getOptions(query);

    set(filterStateAtom, {
      ...get(filterStateAtom),
      filteredValues: options,
      query,
    });
  } else {
    const valuesWithQuery = values.filter((v) =>
      v.label.toLowerCase().includes(query.toLowerCase())
    );

    set(filterStateAtom, {
      ...get(filterStateAtom),
      query,
      filteredValues: valuesWithQuery,
    });
  }
});

const selectDateAtom = atom(null, (get, set, date: Date) => {
  const filterStore = get(filterAtom);
  const currentFilter = filterStore.fitlers?.find(
    (f) => f.field.name === get(filterStateAtom).selectedDateField?.name
  );

  console.log('selectDate', date);
  console.log('currentFilter', currentFilter);
});

export const useFiltering = () => {
  const filterState = useAtomValue(filterStateAtom);
  const open = useSetAtom(openFilterAtom);
  const select = useSetAtom(selectFilterAtom);
  const closeFieldOptions = useSetAtom(closeFieldOptionsFilterAtom);
  const setPosition = useSetAtom(setPositionAtom);
  const openOperatorOptions = useSetAtom(openOperatorOptionsFilterAtom);
  const closeAll = useSetAtom(closeAllFilterAtom);
  const setQuery = useSetAtom(setQueryAtom);
  const selectDate = useSetAtom(selectDateAtom);
  return {
    filterState,
    open,
    select,
    closeFieldOptions,
    setPosition,
    openOperatorOptions,
    closeAll,
    setQuery,
    selectDate,
  };
};
