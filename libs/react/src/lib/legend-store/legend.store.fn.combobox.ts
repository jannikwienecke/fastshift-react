import { getRelationTableName, makeData } from '@apps-next/core';
import { comboboInitialize } from '../field-features/combobox';
import { StoreFn } from './legend.store.types';
import { comboboxStore$ } from './legend.store.derived';

export const comboboxInit: StoreFn<'comboboxInit'> = (store$) => (payload) => {
  const initState = comboboInitialize(payload);

  store$.combobox.set({ ...initState });
};

export const comboboxSelectValue: StoreFn<'comboboxSelectValue'> =
  (store$) => (value) => {
    const state = comboboxStore$.get();
    if (!state.multiple) {
      store$.combobox.selected.set([value]);
    } else {
      const selected = state.selected.some((s) => s.id === value.id)
        ? state.selected.filter((s) => s.id !== value.id)
        : [...state.selected, value];

      store$.combobox.selected.set(selected);
    }
  };

export const comboboxUpdateQuery: StoreFn<'comboboxUpdateQuery'> =
  (store$) => (query) => {
    if (query === '') {
      store$.combobox.query.set('');
      store$.combobox.values.set(null);
    } else if (comboboxStore$.field.get()?.enum) {
      const values = comboboxStore$.values.get();
      store$.combobox.values.set(
        values?.filter((v) =>
          v.label.toLowerCase().includes(query.toLowerCase())
        ) || []
      );
    } else {
      store$.combobox.query.set(query);
    }
  };

export const comboboxHandleQueryData: StoreFn<'comboboxHandleQueryData'> =
  (store$) => (data) => {
    const prevSelected = comboboxStore$.selected.get();
    const field = comboboxStore$.field.get();
    const tableName = getRelationTableName(field);

    const dataModel = makeData(store$.views.get(), tableName)(data);

    const selected = dataModel.rows.filter((d) =>
      prevSelected.some((s) => s.id === d.id)
    );

    dataModel.rows.sort((a, b) => {
      const aSelected = selected.some((s) => s.id === a.id);
      const bSelected = selected.some((s) => s.id === b.id);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });

    store$.combobox.values.set(dataModel.rows);
  };
