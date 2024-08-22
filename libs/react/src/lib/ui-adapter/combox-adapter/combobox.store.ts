import { atomWithDebounce } from '@apps-next/core';
import { FormField } from '@apps-next/ui';
import { atom } from 'jotai';
import { initialFormAtom } from '../form-adapter/form.store';

type ComboboxState<
  T extends { id: string; label: string } = {
    id: string;
    label: string;
  }
> = {
  values: T[];
  selected: null | T;
  query: string;
  debouncedQuery: string;
  formField?: FormField;
};

const comboboxAtom = atom<ComboboxState>({
  values: [],
  selected: null,
  query: '',
  debouncedQuery: '',
  formField: undefined,
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
  (get, set, update: Partial<ComboboxState>) => {
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
    const { formField } = get(comboboxAtom);

    const formData = get(initialFormAtom);

    set(initialFormAtom, {
      ...formData,
      fields: formData.fields.map((field) => {
        if (field.name === formField?.relation?.tableName) {
          return {
            ...field,
            value: update.selected?.id,
          };
        }

        return field;
      }),
    });

    set(comboboxAtom, {
      ...get(comboboxAtom),
      ...update,
    });
  }
);
