import { getRelationTableName, makeData } from '@apps-next/core';
import { comboboInitialize } from '../field-features/combobox';
import { StoreFn } from './legend.store.types';

export const comboboxInit: StoreFn<'comboboxInit'> = (store$) => (payload) => {
  const initState = comboboInitialize(store$.combobox.get(), payload);

  store$.combobox.set({ ...initState });
};

export const comboboxSelectValue: StoreFn<'comboboxSelectValue'> =
  (store$) => (value) => {
    if (!store$.combobox.get().multiple) {
      store$.combobox.selected.set([value]);
    } else {
      const selected = store$.combobox
        .get()
        .selected.some((s) => s.id === value.id)
        ? store$.combobox.selected.get().filter((s) => s.id !== value.id)
        : [...store$.combobox.selected.get(), value];

      store$.combobox.selected.set(selected);
    }
  };

export const comboboxUpdateQuery: StoreFn<'comboboxUpdateQuery'> =
  (store$) => (query) => {
    if (query === '') {
      store$.combobox.query.set('');
      store$.combobox.values.set(store$.combobox.fallbackData.get());
    } else if (store$.combobox.field.get()?.enum) {
      store$.combobox.values.set(
        store$.combobox.values
          .get()
          .filter((v) => v.label.toLowerCase().includes(query.toLowerCase()))
      );
    } else {
      store$.combobox.query.set(query);
    }
  };

export const comboboxHandleQueryData: StoreFn<'comboboxHandleQueryData'> =
  (store$) => (data) => {
    const prevSelected = store$.combobox.selected.get();
    const tableName = getRelationTableName(store$.combobox.field.get());

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
