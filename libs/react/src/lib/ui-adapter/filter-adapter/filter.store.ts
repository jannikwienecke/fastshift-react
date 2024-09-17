import { ComboxboxItem, RegisteredViews, FieldConfig } from '@apps-next/core';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { getViewConfigAtom } from '../../stores';

type FilterState = {
  query: string;
  values: ComboxboxItem[];
  open: boolean;
  tableName: string;
  id: string | null;
  registeredViews: RegisteredViews;
  selectedField: FieldConfig | null;
};

const DEFAULT_FILTER_STATE: FilterState = {
  query: '',
  values: [],
  open: false,
  tableName: '',
  id: null,
  registeredViews: {},
  selectedField: null,
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
  console.log('CLOSE FILTER');
  set(filterStateAtom, { ...get(filterStateAtom), ...DEFAULT_FILTER_STATE });
});

export const useFiltering = () => {
  const filterState = useAtomValue(filterStateAtom);
  const open = useSetAtom(openFilterAtom);
  const select = useSetAtom(selectFilterAtom);
  const close = useSetAtom(closeFilterAtom);

  return {
    filterState,
    open,
    select,
    close,
  };
};
