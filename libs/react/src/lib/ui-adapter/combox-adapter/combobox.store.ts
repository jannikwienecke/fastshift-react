import { atomWithDebounce } from '@apps-next/core';
import { atom } from 'jotai';

type ComboboxState<T extends { id: string; label: string }> = {
  values: T[];
  selected: null | T;
  query: string;
  debouncedQuery: string;
};

const comboboxAtom = atom<ComboboxState<any>>({
  values: [],
  selected: null,
  query: '',
  debouncedQuery: '',
});

export const {
  isDebouncingAtom,
  debouncedValueAtom: debouncedQueryAtom,
  clearTimeoutAtom,
  currentValueAtom,
} = atomWithDebounce('');

export const comboboxStateAtom = atom(
  (get) => {
    const debouncedQuery = get(debouncedQueryAtom);
    const query = get(currentValueAtom);

    return {
      values: get(comboboxAtom).values,
      selected: get(comboboxAtom).selected,
      query: query,
      debouncedQuery: debouncedQuery,
    };
  },
  (get, set, update: Partial<ComboboxState<any>>) => {
    set(comboboxAtom, {
      ...get(comboboxAtom),
      ...update,
    });
  }
);

export const testAtom = atom((get) => get(debouncedQueryAtom).length);

export const updateValuesAtom = atom(
  null,
  (get, set, update: Partial<ComboboxState<any>>) => {
    set(comboboxAtom, {
      ...get(comboboxAtom),
      ...update,
    });
  }
);
