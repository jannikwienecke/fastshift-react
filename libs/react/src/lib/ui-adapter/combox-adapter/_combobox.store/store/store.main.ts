import { atom } from 'jotai';
import { comboboInitialize } from '../../../../field-features/combobox';
import { ComboboxStoreAction } from './store.actions.types';
import { ComboboxStore, DEFAULT_STORE } from './store.type';

export const storeAtom = atom<ComboboxStore>(DEFAULT_STORE);
storeAtom.debugLabel = 'Global Store';

export const storeReducer = (
  prev: ComboboxStore,
  action: ComboboxStoreAction
): ComboboxStore => {
  console.debug('combobox store reducer', {
    before: prev,
    action,
  });

  const handle = (): ComboboxStore => {
    if (action.type === 'CLOSE') {
      if (!prev.open) return prev;

      return {
        ...prev,
        ...DEFAULT_STORE,
        open: false,
        id: null,
      };
    }

    if (action.type === 'INITIALIZE') {
      return comboboInitialize(prev, action.payload);
    }

    if (action.type === 'UPDATE_QUERY') {
      const query = action.payload;
      if (query === '') {
        return {
          ...prev,
          values: prev.fallbackData,
          query: '',
        };
      } else if (prev.field?.enum) {
        return {
          ...prev,
          query,
          values: prev.values.filter((v) =>
            v.label.toLowerCase().includes(query.toLowerCase())
          ),
        };
      }

      return {
        ...prev,
        query,
      };
    }

    if (action.type === 'HANDLE_QUERY_DATA') {
      const data = action.data;
      const selected = data.filter((d) =>
        prev.selected.some((s) => s.id === d.id)
      );

      data.sort((a, b) => {
        const aSelected = selected.some((s) => s.id === a.id);
        const bSelected = selected.some((s) => s.id === b.id);

        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
      });

      return {
        ...prev,
        values: data,
      };
    }

    if (action.type === 'SELECT_VALUE') {
      const value = action.payload;

      if (!prev.multiple) {
        return {
          ...prev,
          selected: [value],
        };
      } else {
        const selected = prev.selected.some((s) => s.id === value.id)
          ? prev.selected.filter((s) => s.id !== value.id)
          : [...prev.selected, value];

        return {
          ...prev,
          selected,
        };
      }
    }

    throw new Error('unknown action type' + action);
  };

  const store = handle();

  console.debug('combobox store reducer', {
    after: store,
  });

  return store;
};
