import {
  getRelationTableName,
  makeData,
  makeDayMonthString,
  makeRow,
  makeRowFromValue,
} from '@apps-next/core';
import {
  getTimeValueFromDateString,
  SELECT_FILTER_DATE,
} from '../ui-adapter/filter-adapter';
import {
  initSelected$,
  newSelected$,
  removedSelected$,
} from './legend.combobox.helper';
import { comboboxStore$ } from './legend.store.derived.combobox';
import { StoreFn } from './legend.store.types';

export const comboboxClose: StoreFn<'comboboxClose'> = (store$) => () => {
  store$.deselectRelationField();
  store$.filterCloseAll();

  store$.commandform.rect.set(undefined);
  store$.commandform.field.set(undefined);

  // displayOptions
  store$.displayOptionsCloseCombobox();

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

    store$.comboboxSelectValue(
      makeRow(dateAsNumber, dateString, date.toISOString(), field)
    );
    store$.combobox.datePicker.set(null);
  };

export const comboboxSelectValue: StoreFn<'comboboxSelectValue'> =
  (store$) => (value) => {
    const state = comboboxStore$.get();

    if (value.id === SELECT_FILTER_DATE) {
      store$.combobox.datePicker.open.set(true);
    } else if (store$.displayOptions.isOpen.get()) {
      const displayOptions = store$.displayOptions.get();
      const sortingOpen = displayOptions.sorting.isOpen;
      const groupingOpen = displayOptions.grouping.isOpen;
      if (sortingOpen || groupingOpen) {
        store$.displayOptionsSelectField(value);
      } else {
        //
      }
    } else if (store$.filter.open.get()) {
      if (state.field) {
        store$.filterSelectFilterValue(value);
      } else {
        store$.combobox.query.set('');
        store$.filterSelectFilterType(value);
      }
    } else if (store$.commandform.open.get()) {
      store$.combobox.query.set('');

      if (store$.commandform.field.get()) {
        store$.commanformSelectRelationalValue(value);
      }
    } else {
      if (!state.multiple) {
        store$.combobox.selected.set([value]);

        store$.comboboxRunSelectMutation(value, null);
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

        store$.comboboxRunSelectMutation(value, state.selected);
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

export const comboboxRunSelectMutation: StoreFn<'comboboxRunSelectMutation'> =
  (store$) => async (value, existingRows) => {
    const { row, field } = comboboxStore$.get();

    if (!row) return;
    if (!field) throw new Error('no field');

    // close if not is manyToManyField
    if (!field.relation?.manyToManyRelation) {
      setTimeout(() => {
        store$.deselectRelationField();
        store$.comboboxClose();
      }, 100);

      let valueToUse = value;
      if (field.type === 'Date' && row) {
        const datetime = getTimeValueFromDateString(value.id, true);
        valueToUse = makeRowFromValue(datetime, field);
      }

      store$.updateRecordMutation({
        field,
        valueRow: valueToUse,
        row,
      });
    } else {
      store$.selectRowsMutation({
        field,
        existingRows: existingRows ?? [],
        checkedRow: value,
        row,
      });
    }
  };
