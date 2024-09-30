import {
  getRelationTableName,
  makeData,
  RecordType,
  Row,
} from '@apps-next/core';
import { comboboInitialize } from '../field-features/combobox';
import { handleSelectUpdate } from '../field-features/update-record-mutation';
import { comboboxStore$ } from './legend.store.derived';
import { filterSelectFilterValue } from './legend.store.fn.filter';
import { StoreFn } from './legend.store.types';

export const comboboxInit: StoreFn<'comboboxInit'> = (store$) => (payload) => {
  const initState = comboboInitialize(payload);

  store$.combobox.set({ ...initState });
};

export const comboboxClose: StoreFn<'comboboxClose'> = (store$) => () => {
  // TODO BUILD EVENT DRIVEN
  // add events and attach function that reacts to the events
  store$.deselectRelationField();
  store$.filterClose();
};

export const comboboxSelectValue: StoreFn<'comboboxSelectValue'> =
  (store$) => (value) => {
    if (store$.filter.selectedField.get()) {
      filterSelectFilterValue(store$)(value);
    }

    const state = comboboxStore$.get();
    if (!state.multiple) {
      store$.combobox.selected.set([value]);
    } else {
      const selected = state.selected.some((s) => s.id === value.id)
        ? state.selected.filter((s) => s.id !== value.id)
        : [...state.selected, value];

      store$.combobox.selected.set(selected);
    }

    store$.comboboxRunSelectMutation(value);
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

let timeout: NodeJS.Timeout | null = null;

export const comboboxRunSelectMutation: StoreFn<'comboboxRunSelectMutation'> =
  (store$) => (value) => {
    const runMutation = store$.api?.mutateAsync;

    const selected = store$.combobox.selected.get();
    const { row, field } = comboboxStore$.get();

    if (!row) return;
    if (!field) throw new Error('no field');

    const isManyToManyRelation = field?.relation?.manyToManyRelation;

    // close if not is manyToManyField
    if (!isManyToManyRelation) {
      setTimeout(() => {
        store$.deselectRelationField();
      }, 100);
    }

    if (field.type === 'Boolean' && row) {
      const mutation = handleSelectUpdate({
        field,
        row,
        value,
        selected: selected ?? [],
      });

      runMutation({
        mutation: mutation,
      });
      return;
    }

    const selectedId = getSelectedId(selected);

    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }

    timeout = setTimeout(
      () => {
        if (!field) return;

        const valueToUpdate =
          !field.relation && !field.enum ? value.raw : value.id;

        runMutation({
          mutation: {
            type: 'UPDATE_RECORD',
            handler: (items) => {
              if (isManyToManyRelation) return items;

              return items.map((item) => {
                if (item['id'] === row.id) {
                  const newValue = {
                    ...item,
                    [field.name]: isManyToManyRelation
                      ? updateManyToManyRelation(item[field.name], value)
                      : value.raw,
                  };
                  return newValue;
                }
                return item;
              });
            },
            payload: {
              id: row.id,
              // TODO: Select Combobox improvement
              // send a list of new ids
              // and a list of deleted ids
              record: {
                [field.relation?.fieldName ?? field.name]: isManyToManyRelation
                  ? selectedId
                  : valueToUpdate,
              },
            },
          },
        });
      },
      isManyToManyRelation ? 500 : 0
    );
  };

function updateManyToManyRelation(
  currentValues: RecordType[],
  newValue: RecordType
) {
  const existingIndex = currentValues.findIndex(
    (value) => value['id'] === newValue['id']
  );
  return existingIndex !== -1
    ? currentValues.filter((_, index) => index !== existingIndex)
    : [...currentValues, newValue];
}

export const getSelectedId = (selected: Row | Row[]) => {
  return typeof selected === 'string'
    ? selected
    : Array.isArray(selected)
    ? selected.map((v) => v.id)
    : (selected as Row)?.id;
};
