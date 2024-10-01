import { getRelationTableName, makeData, Row } from '@apps-next/core';
import { Observable } from '@legendapp/state';
import { comboboInitialize } from '../field-features/combobox';
import { handleSelectUpdate } from '../field-features/update-record-mutation';
import { comboboxStore$ } from './legend.store.derived';
import { LegendStore, StoreFn } from './legend.store.types';

export const comboboxInit: StoreFn<'comboboxInit'> = (store$) => (payload) => {
  const initState = comboboInitialize(payload);

  store$.combobox.set({ ...initState });
};

export const comboboxClose: StoreFn<'comboboxClose'> = (store$) => () => {
  // TODO BUILD EVENT DRIVEN
  // add events and attach function that reacts to the events
  store$.deselectRelationField();
  store$.filterCloseAll();
};

export const comboboxSelectValue: StoreFn<'comboboxSelectValue'> =
  (store$) => (value) => {
    const state = comboboxStore$.get();

    if (store$.filter.selectedField.get()) {
      store$.filterSelectFilterValue(value);
    } else {
      if (!state.multiple) {
        store$.combobox.selected.set([value]);

        store$.comboboxRunSelectMutation(value, value);
      } else {
        const selected = state.selected.some((s) => s.id === value.id)
          ? state.selected.filter((s) => s.id !== value.id)
          : [...state.selected, value];

        store$.combobox.selected.set(selected);
        store$.comboboxRunSelectMutation(value, selected);
      }
    }
  };

export const comboboxUpdateQuery: StoreFn<'comboboxUpdateQuery'> =
  (store$) => (query) => {
    if (query === '') {
      store$.combobox.query.set('');
      store$.combobox.values.set(null);
    } else if (comboboxStore$.field.get()?.enum) {
      store$.combobox.query.set(query);

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
let runningMutation = false;

export const comboboxRunSelectMutation: StoreFn<'comboboxRunSelectMutation'> =
  (store$) => (value, newSelected) => {
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

    if (!runningMutation) {
      // only run a optimisic update if we are not already running a mutation
      updateDataModel(store$, newSelected);
    }

    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }

    timeout = setTimeout(
      async () => {
        if (!field) return;

        const valueToUpdate =
          !field.relation && !field.enum ? value.raw : value.id;

        try {
          runningMutation = true;
          await runMutation({
            mutation: {
              type: 'UPDATE_RECORD',
              payload: {
                id: row.id,
                // TODO: Select Combobox improvement
                // send a list of new ids
                // and a list of deleted ids
                record: {
                  [field.relation?.fieldName ?? field.name]:
                    isManyToManyRelation ? selectedId : valueToUpdate,
                },
              },
            },
          });
        } catch (error) {
          console.log(error);
        } finally {
          runningMutation = false;
        }
      },
      isManyToManyRelation ? 1000 : 0
    );
  };

export const getSelectedId = (selected: Row | Row[]) => {
  return typeof selected === 'string'
    ? selected
    : Array.isArray(selected)
    ? selected.map((v) => v.id)
    : (selected as Row)?.id;
};

const updateDataModel = (
  store$: Observable<LegendStore>,
  selected: Row[] | Row
) => {
  const selectedRelationField = store$.list.selectedRelationField.get();
  if (!selectedRelationField) return;

  const rows = store$.dataModel
    .get()
    ?.rows.map((row) => row.raw)
    .map((row) => {
      if (row.id === selectedRelationField?.row?.id) {
        return {
          ...row,
          [selectedRelationField?.field?.name]: Array.isArray(selected)
            ? selected.map((s) => s.raw)
            : selected.raw,
        };
      }

      return row;
    });

  store$.createDataModel(rows);
};
