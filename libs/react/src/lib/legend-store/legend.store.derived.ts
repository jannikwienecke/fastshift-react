import {
  ComboxboxItem,
  Row,
  getRelationTableName,
  makeRow,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { comboboInitialize } from '../field-features/combobox';
import { store$ } from './legend.store';
import { DEFAULT_COMBOBOX_STATE } from './legend.store.constants';
import { ComboboxState, FilterStore } from './legend.store.types';
import { filterUtil, operator } from '../ui-adapter/filter-adapter';

export const comboboxStore$ = observable<ComboboxState>(() => {
  const selectedFilterField = store$.filter.selectedField.get();
  const selectedListField = store$.list.selectedRelationField.field.get();
  const selectedDateField = store$.filter.selectedDateField.get();

  const field = selectedFilterField || selectedListField || selectedDateField;

  const rect =
    store$.filter.rect.get() || store$.list.selectedRelationField.rect.get();
  const row = store$.list.selectedRelationField.row.get() as Row<any> | null;
  const selected = store$.list.selectedRelationField.selected.get();
  const storeSelected = store$.combobox.selected.get();

  const filter = store$.filter.filters.get().find((f) => f.field === field);

  const selectedOfFilter = filter ? filterUtil().getValues(filter) : null;

  if (!field || !rect) return DEFAULT_COMBOBOX_STATE;
  if (field.type === 'String' || field.type === 'Number')
    return DEFAULT_COMBOBOX_STATE;

  const tableName = getRelationTableName(field);
  const defaultData = store$.relationalDataModel[tableName].get();

  const { values } = store$.combobox.get();

  const filterValues = store$.filter.values.get();

  const state = comboboInitialize({
    field,
    row,
    defaultData,
    rect,
    multiple: selectedFilterField ? true : undefined,
    selected: storeSelected.length
      ? storeSelected
      : (selectedOfFilter || selected) ?? [],
  });

  const defaultSelected = Array.isArray(selected) ? selected : [];

  const selectedIds = defaultSelected.map((row) => row.id);

  const _values = (
    filterValues.length
      ? filterValues
      : values !== null && store$.combobox.query.get().length
      ? values
      : defaultData?.rows ?? values ?? []
  ).filter((row) => !selectedIds.includes(row.id.toString()));

  return {
    ...state,
    rect: state.rect ?? store$.filter.rect.get(),
    open: !store$.filter.showDatePicker.get() ? true : false,
    field,
    values: [...defaultSelected, ..._values],
    query: store$.combobox.query.get(),
    selected: state.selected,
  } satisfies ComboboxState;
});

// derived stores from main store
export const filterValuesStore$ = observable<FilterStore>(() => {
  const viewConfigManager = store$.viewConfigManager.get();
  const viewFields = viewConfigManager.getViewFieldList();
  const operatorField = store$.filter.selectedOperatorField.get();

  let values: ComboxboxItem[] = viewFields.map((field) => {
    return {
      id: field.name,
      label: field.name,
    };
  });

  if (operatorField) {
    const allFilters = store$.filter.filters.get();
    const filter = allFilters.find((f) => f.field.name === operatorField.name);
    values = filter ? operator().makeOptionsFrom(filter.field, filter) : [];
  }

  return {
    ...store$.filter.get(),
    values,
  };
});
