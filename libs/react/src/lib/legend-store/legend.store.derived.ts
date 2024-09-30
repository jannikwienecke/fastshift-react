import { Row, getRelationTableName, makeRow } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { comboboInitialize } from '../field-features/combobox';
import { filterUtil } from '../ui-adapter/filter-adapter';
import { store$ } from './legend.store';
import { DEFAULT_COMBOBOX_STATE } from './legend.store.constants';
import { ComboboxState } from './legend.store.types';

export const comboboxDebouncedQuery$ = observable('');

export const comboboxStore$ = observable<ComboboxState>(() => {
  const selectedFilterField = store$.filter.selectedField.get();
  const selectedListField = store$.list.selectedRelationField.field.get();

  const field = selectedFilterField || selectedListField;

  const rect =
    store$.filter.rect.get() || store$.list.selectedRelationField.rect.get();
  const row = store$.list.selectedRelationField.row.get() as Row<any> | null;
  const selected = store$.list.selectedRelationField.selected.get();
  const storeSelected = store$.combobox.selected.get();

  const filter = store$.filter.filters.get().find((f) => f.field === field);

  const selectedOfFilter = filter ? filterUtil().getValues(filter) : null;

  if (!field || !rect) return DEFAULT_COMBOBOX_STATE;
  if (
    field.type === 'String' ||
    field.type === 'Number' ||
    field.type === 'Boolean' ||
    selectedFilterField?.enum
  )
    return DEFAULT_COMBOBOX_STATE;

  const tableName = getRelationTableName(field);
  const defaultData = store$.relationalDataModel[tableName]?.get();

  const { values } = store$.combobox.get();

  const filterValues = store$.filter.values.get();

  const state = comboboInitialize({
    field,
    row,
    defaultData: defaultData ?? null,
    rect,
    multiple: selectedFilterField ? true : undefined,
    selected: storeSelected.length
      ? storeSelected
      : (selectedOfFilter || selected) ?? [],
  });

  const defaultSelected = Array.isArray(selected) ? selected : [];

  const selectedIds = defaultSelected.map((row) => row.id);

  const query = comboboxDebouncedQuery$.get().toLowerCase();
  const _values = (
    filterValues.length
      ? filterValues
      : values !== null && comboboxDebouncedQuery$.get().length
      ? values
      : defaultData?.rows ?? values ?? []
  ).filter((row) => !selectedIds.includes(row.id.toString()));

  const filteredDefaultSelected = defaultSelected.filter((v) =>
    v.label.toLowerCase().includes(query)
  );

  let enumValues: Row[] | null = null;
  if (field?.enum) {
    enumValues = field.enum?.values
      .filter((v) => v.name.toLowerCase().includes(query))
      .map((v) => makeRow(v.name, v.name, v.name, field));
  }

  return {
    ...state,
    rect: state.rect ?? store$.filter.rect.get(),
    open: !store$.filter.showDatePicker.get() ? true : false,
    field,
    values: enumValues ?? [...filteredDefaultSelected, ..._values],
    query: store$.combobox.query.get(),
    selected: state.selected,
  } satisfies ComboboxState;
});
