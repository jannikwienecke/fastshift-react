import { makeRow } from '@apps-next/core';
import { atom } from 'jotai';
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
      const { row, field, defaultData, selected } = action.payload;
      if (!row || !field) return prev;
      const id = row.id + field.name;

      if (prev.id === id) return prev;

      if (field.enum) {
        const values = field.enum.values.map((v) => {
          return makeRow(v.name, v.name, v.name, field);
        });

        return {
          ...DEFAULT_STORE,
          ...action.payload,
          id,
          open: true,
          values,
          fallbackData: values,

          multiple: false,
          selected: [
            makeRow(
              selected.toString(),
              selected.toString(),
              selected.toString(),
              field
            ),
          ],
        };
      }

      if (!Array.isArray(selected) && typeof selected !== 'object') {
        return prev;
      }

      const table = action.payload.field?.relation?.tableName ?? '';
      const defaultValues = defaultData?.rows ?? [];

      const selectedValues = Array.isArray(selected)
        ? selected
        : selected.id
        ? [selected]
        : [];

      const values = [...selectedValues, ...defaultValues];
      const uniqueIds = Array.from(new Set(values.map((v) => v.id)));
      const uniqueValues = uniqueIds
        .map((id) => values.find((v) => v.id === id))
        .filter((v) => v !== undefined);

      const multiple = Boolean(field?.relation?.manyToManyRelation);

      return {
        ...DEFAULT_STORE,
        ...action.payload,
        id,
        tableName: table,
        open: true,
        values: uniqueValues,
        selected: selectedValues,
        fallbackData: uniqueValues,
        multiple,
      };
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
