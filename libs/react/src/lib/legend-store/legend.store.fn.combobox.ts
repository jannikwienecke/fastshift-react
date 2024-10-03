import {
  getRelationTableName,
  makeData,
  makeDayMonthString,
  makeRow,
  Mutation,
  RecordType,
  Row,
} from '@apps-next/core';
import { Observable } from '@legendapp/state';
import { comboboInitialize } from '../field-features/combobox';
import { handleSelectUpdate } from '../field-features/update-record-mutation';
import {
  dateUtils,
  operatorMap,
  SELECT_FILTER_DATE,
} from '../ui-adapter/filter-adapter';
import {
  comboboxStore$,
  initSelected$,
  newSelected$,
  removedSelected$,
} from './legend.store.derived';
import { LegendStore, StoreFn } from './legend.store.types';

export const comboboxInit: StoreFn<'comboboxInit'> = (store$) => (payload) => {
  const initState = comboboInitialize(payload);

  newSelected$.set([]);
  removedSelected$.set([]);
  initSelected$.set(null);
  store$.combobox.set({ ...initState, datePicker: null });
};

export const comboboxClose: StoreFn<'comboboxClose'> = (store$) => () => {
  // TODO BUILD EVENT DRIVEN
  // add events and attach function that reacts to the events
  store$.deselectRelationField();
  store$.filterCloseAll();
  newSelected$.set([]);
  removedSelected$.set([]);
  initSelected$.set(null);
  store$.combobox.datePicker.set(null);
};

export const comboboxSelectDate: StoreFn<'comboboxSelectDate'> =
  (store$) => (date) => {
    const { field } = comboboxStore$.get();
    if (!field) return;

    store$.combobox.datePicker.selected.set(date);

    const dateString = makeDayMonthString(date);

    const dateAsNumber = date.getTime();

    console.log({ dateString, dateAsNumber });
    store$.comboboxSelectValue(
      makeRow(dateAsNumber, dateString, date.toISOString(), field)
    );
  };

export const comboboxSelectValue: StoreFn<'comboboxSelectValue'> =
  (store$) => (value) => {
    const state = comboboxStore$.get();

    if (value.id === SELECT_FILTER_DATE) {
      store$.combobox.datePicker.open.set(true);
    } else if (store$.filter.open.get()) {
      if (state.field) {
        store$.filterSelectFilterValue(value);
      } else {
        store$.combobox.query.set('');
        store$.filterSelectFilterType(value);
      }
    } else {
      if (!state.multiple) {
        store$.combobox.selected.set([value]);

        store$.comboboxRunSelectMutation(value, value);
      } else {
        const selected = state.selected.some((s) => s.id === value.id)
          ? state.selected.filter((s) => s.id !== value.id)
          : [...state.selected, value];

        store$.combobox.selected.set(selected);

        if (!state.selected.map((s) => s.id).includes(value.id)) {
          newSelected$.set([...newSelected$.get(), value]);

          removedSelected$.set(
            removedSelected$.get().filter((s) => s.id !== value.id)
          );
        } else {
          removedSelected$.set([...removedSelected$.get(), value]);
          newSelected$.set(newSelected$.get().filter((s) => s.id !== value.id));
        }

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
        store$.comboboxClose();
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
        viewName: store$.viewConfigManager.viewConfig.viewName.get(),
        query: store$.globalQuery.get(),
      });
      return;
    }

    // TODO REFACTOR THIS -> GET VALUE PART
    const selectedRelationField = store$.list.selectedRelationField.get();
    if (!selectedRelationField) return;
    let dateValueToUpdate: number | null | undefined = undefined;
    if (
      selectedRelationField.field.type === 'Date' &&
      !Array.isArray(newSelected)
    ) {
      const parsed = dateUtils.parseOption(newSelected.id, operatorMap.is);
      const { start } = dateUtils.getStartAndEndDate(parsed);
      start?.setHours(2, 0, 0, 0);
      dateValueToUpdate = start?.getTime();
      if (newSelected.id === 'No date') {
        dateValueToUpdate = null;
      }
    }

    const valueToUpdate = Array.isArray(newSelected)
      ? newSelected
          .map((s) => s.raw)
          .sort((a, b) => b._creationTime - a._creationTime)
      : dateValueToUpdate !== undefined
      ? dateValueToUpdate
      : newSelected.raw;

    if (!runningMutation) {
      // only run a optimisic update if we are not already running a mutation
      updateDataModel(store$, valueToUpdate);
    }

    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }

    timeout = setTimeout(
      async () => {
        if (!field) return;

        const valueToUpdate =
          dateValueToUpdate !== undefined
            ? dateValueToUpdate
            : !field.relation && !field.enum
            ? value.raw
            : value.id;

        let mutation: Mutation | undefined = undefined;
        if (isManyToManyRelation) {
          const { idsToDelete, newIds } = getIds(store$, selected);
          mutation = {
            type: 'SELECT_RECORDS',
            payload: {
              id: row.id,
              table: getRelationTableName(field),
              idsToDelete,
              newIds,
            },
          };
        } else {
          mutation = {
            type: 'UPDATE_RECORD',
            payload: {
              id: row.id,
              record: {
                [field.relation?.fieldName ?? field.name]: valueToUpdate,
              },
            },
          };
        }
        if (!mutation) return;
        try {
          runningMutation = true;

          const result = await runMutation({
            mutation: mutation,
            viewName: store$.viewConfigManager.viewConfig.viewName.get(),
            query: store$.globalQuery.get(),
          });

          if (result.error) {
            removedSelected$.set([]);
            newSelected$.set([]);
            initSelected$.set(null);
          }

          if (isManyToManyRelation) {
            const updatedRow = {
              ...store$.list.selectedRelationField.row.raw.get(),
              [field.name]: store$.dataModel.rows
                .get()
                ?.find((r) => r.id === row.id)?.raw?.[field.name],
            };

            // also update for non many to many relations
            store$.list.selectedRelationField.row.raw.set(updatedRow);
          }
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

const updateDataModel = (store$: Observable<LegendStore>, value: any) => {
  const selectedRelationField = store$.list.selectedRelationField.get();
  if (!selectedRelationField) return;

  const rows = store$.dataModel
    .get()
    ?.rows.map((row) => row.raw)
    .map((row) => {
      if (row['id'] === selectedRelationField?.row?.id) {
        return {
          ...row,
          [selectedRelationField?.field?.name]: value,
        };
      }

      return row;
    });

  store$.createDataModel(rows);
};

export const getIds = (
  store$: Observable<LegendStore>,
  selected: Row[] | Row
) => {
  if (!Array.isArray(selected)) return { idsToDelete: [], newIds: [] };

  const row = store$.list.selectedRelationField.row.get();
  const field = store$.list.selectedRelationField.field.get();

  if (!row || !field) return { idsToDelete: [], newIds: [] };

  const data = store$.dataModel.rows.get().find((r) => r.id === row.id);
  const valueIdsAfter: string[] = data?.raw?.[field.name]?.map(
    (v: RecordType) => v['id']
  );

  const existingIds: string[] = row.raw?.[field.name]?.map(
    (v: RecordType) => v['id']
  );
  const newIds_ = selected
    .map((s) => s.id)
    .filter((id) => !existingIds.includes(id));

  const idsToDelete = existingIds.filter((id) => !valueIdsAfter.includes(id));

  return {
    idsToDelete,
    newIds: newIds_,
  };
};
