import { atomWithDebounce, Model, RecordType } from '@apps-next/core';
import { ComboxboxItem, FormField } from '@apps-next/ui';
import { atom } from 'jotai';

export type State = {
  dataRaw: RecordType[];
  data: Model<RecordType>;
  values: ComboxboxItem[];
  selected: null | ComboxboxItem;
  formField?: FormField;
  initialized: boolean;
};

// each combobox input field has its own state: {task : {....}, project: {...}}
type ComboboxState<> = {
  [key in string]: State;
};

const comboboxAtom = atom<ComboboxState>({});

export const {
  isDebouncingAtom,
  debouncedValueAtom: debouncedQueryAtom,
  clearTimeoutAtom,
  currentValueAtom,
} = atomWithDebounce({
  query: '',
  fieldName: '',
});

export const comboboxStateAtom = atom((get) => {
  const debouncedQuery = get(debouncedQueryAtom);
  const query = get(currentValueAtom);

  return {
    query: query,
    debouncedQuery: debouncedQuery,
    state: get(comboboxAtom),
  };
});

export const getStateByAtom = atom(
  null,
  (get, _, props: { fieldName: string; rowId: string | number }) => {
    const state = get(comboboxAtom);
    return state[props.fieldName] as State | undefined;
  }
);

export const updateValuesAtom = atom(
  null,
  (
    get,
    set,
    update: {
      fieldName: string;
      state: Partial<State>;
    }
  ) => {
    const state = get(comboboxAtom);

    const fieldName = update.fieldName;
    const newState = update.state;

    set(comboboxAtom, {
      ...state,
      [fieldName]: {
        ...state[fieldName],
        ...newState,
        selected: newState.selected?.id
          ? newState.selected
          : state[fieldName]?.selected,
      },
    });
  }
);

export const initComboboxAtom = atom(
  null,
  (
    get,
    set,
    update: { fieldName: string; initialSelected: State['selected'] }
  ) => {
    const { fieldName, initialSelected } = update;
    const state = get(comboboxAtom);

    set(comboboxAtom, {
      ...state,
      [fieldName]: {
        ...state[fieldName],
        selected: initialSelected,
        initialized: true,
      },
    });
  }
);
