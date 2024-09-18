import { ComboxboxItem, RegisteredViews, FieldConfig } from '@apps-next/core';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { getViewConfigAtom } from '../../stores';
import {
  EqualIcon,
  EqualNotIcon,
  ArrowBigRight,
  ArrowBigLeft,
} from 'lucide-react';
type FilterState = {
  query: string;
  values: ComboxboxItem[];
  open: boolean;
  tableName: string;
  id: string | null;
  registeredViews: RegisteredViews;
  selectedField: FieldConfig | null;
  rect: DOMRect | null;
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
  const viewConfigManager = get(getViewConfigAtom);
  const field = viewConfigManager.getFieldBy(value.id.toString());

  set(filterStateAtom, { ...get(filterStateAtom), selectedField: field });
});

export const closeFilterAtom = atom(null, (get, set) => {
  set(filterStateAtom, { ...get(filterStateAtom), ...DEFAULT_FILTER_STATE });
});

const setPositionAtom = atom(null, (get, set, rect: DOMRect) => {
  set(filterStateAtom, { ...get(filterStateAtom), rect });
});

export const openOperatorOptionsFilterAtom = atom(
  null,
  (get, set, field: FieldConfig) => {
    // HIER WEITER MACHEN
    // have one file that manages and stores all the operators
    // DICT for all field types matches with the available operators
    // and also a function that updates the operator based on the current value
    // for example if 2 values are selected, then -> in instead of is
    // make this dynamic based on the field type
    const values = [
      {
        id: 'eq',
        label: 'Equal to',
        icon: EqualIcon,
      },
      {
        id: 'neq',
        label: 'Not equal to',
        icon: EqualNotIcon,
      },
      {
        id: 'gt',
        label: 'Greater than',
        icon: ArrowBigRight,
      },
      {
        id: 'lt',
        label: 'Less than',
        icon: ArrowBigLeft,
      },
    ] satisfies ComboxboxItem[];

    set(filterStateAtom, { ...get(filterStateAtom), values, open: true });
  }
);

export const useFiltering = () => {
  const filterState = useAtomValue(filterStateAtom);
  const open = useSetAtom(openFilterAtom);
  const select = useSetAtom(selectFilterAtom);
  const close = useSetAtom(closeFilterAtom);
  const setPosition = useSetAtom(setPositionAtom);
  const openOperatorOptions = useSetAtom(openOperatorOptionsFilterAtom);

  return {
    filterState,
    open,
    select,
    close,
    setPosition,
    openOperatorOptions,
  };
};
