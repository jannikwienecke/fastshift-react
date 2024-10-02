import {
  FieldConfig,
  NONE_OPTION,
  RecordType,
  Row,
  getRelationTableName,
  makeRow,
  makeRowFromValue,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { comboboInitialize } from '../field-features/combobox';
import { dateUtils, filterUtil, operator } from '../ui-adapter/filter-adapter';
import { store$ } from './legend.store';
import { DEFAULT_COMBOBOX_STATE } from './legend.store.constants';
import { ComboboxState } from './legend.store.types';

export const comboboxDebouncedQuery$ = observable('');
// items that were selected/deselected in a "session" -> session ends when combobox is closed
export const newSelected$ = observable<Row[]>([]);
export const removedSelected$ = observable<Row[]>([]);
// we need to save which items were selected when the combobox is opened
// so that we can track which items are shown on the top (when adding a new item it should not move to the top. it should stay where it is)
export const initSelected$ = observable<Row[] | null>(null);

export const comboboxStore$ = observable<ComboboxState>(() => {
  const selectedFilterField = store$.filter.selectedField.get();
  const selectedListField = store$.list.selectedRelationField.field.get();
  const field = selectedFilterField || selectedListField;

  const rect =
    store$.filter.rect.get() || store$.list.selectedRelationField.rect.get();
  const row = store$.list.selectedRelationField.row.get() as Row<any> | null;

  const filter = store$.filter.filters.get().find((f) => f.field === field);
  const selectedOfFilter = filter ? filterUtil().getValues(filter) : null;
  const operatorField = store$.filter.selectedOperatorField.get();

  const filterIsOpen = store$.filter.open.get();

  if ((!field && !filterIsOpen) || !rect) return DEFAULT_COMBOBOX_STATE;
  if (field?.type === 'String') return DEFAULT_COMBOBOX_STATE;

  const tableName = getRelationTableName(field);
  const defaultData = store$.relationalDataModel[tableName]?.get();
  const { values } = store$.combobox.get();
  const query = comboboxDebouncedQuery$.get().toLowerCase();
  const filterValues = store$.filter.values.get();

  const defaultSelected =
    initSelected$.get() ??
    (selectedListField
      ? (row?.raw?.[tableName] as RecordType[])
      : selectedOfFilter);

  const state = comboboInitialize({
    field: field ?? null,
    row,
    defaultData: defaultData ?? null,
    rect,
    multiple: selectedFilterField ? true : undefined,
    selected: [],
  });

  const removedSelectedIds = removedSelected$.get().map((r) => r.id);
  const newSelectedIds = newSelected$.get().map((r) => r.id);

  let enumValues: Row[] | null = null;
  if (field?.enum) {
    enumValues = field.enum?.values
      .filter((v) => v.name.toLowerCase().includes(query))
      .map((v) => makeRow(v.name, v.name, v.name, field));
  }

  const theValues =
    // BOOLEAN
    field?.type === 'Boolean'
      ? state.values ?? []
      : // FILTER
      filterValues.length
      ? filterValues
      : // RELATION WHEN WE HABE A QUERY VALUE
      values !== null && comboboxDebouncedQuery$.get().length
      ? values
      : // FALLBACK (defaultData are relational values)
        defaultData?.rows ?? values ?? [];

  const defaultDataSelected = theValues.filter((row) =>
    defaultSelected?.find?.((s) => s['id'] === row['id'])
  );

  const defaultDataNotSelected = theValues.filter(
    (row) => !defaultDataSelected.find((s) => s.id === row.id)
  );

  const selectedOfList = defaultData?.rows.filter((r) => {
    const isInDefault = defaultSelected?.find?.((s) => s['id'] === r['id']);
    const isInNewSelected = newSelectedIds.includes(r.id.toString());
    const isInRemovedSelected = removedSelectedIds.includes(r.id.toString());

    if (isInRemovedSelected) return false;
    if (isInDefault || isInNewSelected) return true;

    return false;
  });

  if (initSelected$.get() === null) {
    initSelected$.set(
      selectedListField ? selectedOfList || [] : selectedOfFilter || []
    );
  }

  let noneOption: [Row] | null = null;
  if (selectedFilterField && !selectedFilterField.isRequired) {
    const label = `No ${selectedFilterField.name}`;
    noneOption = [makeRow(NONE_OPTION, label, label, {} as FieldConfig)];
  }

  let dateValues: Row[] | null = null;
  if (field?.type === 'Date' && store$.list.selectedRelationField.get()) {
    dateValues = dateUtils
      .getOptionsForEdit(store$.combobox.query.get())
      .map((v) => makeRowFromValue(v.id.toString(), field));
  }

  if (field?.type === 'Date' && !store$.list.selectedRelationField.get()) {
    dateValues = dateUtils
      .getOptionsForFilter(store$.combobox.query.get())
      .map((v) => makeRowFromValue(v.id.toString(), field));
  }

  let filterOptions: Row[] | null = null;
  if (store$.filter.open.get() && !field) {
    const viewFields = store$.viewConfigManager.get().getViewFieldList();
    filterOptions = viewFields.map((field) => {
      return makeRowFromValue(field.name, field);
    });

    filterOptions = filterOptions.filter((f) =>
      f.label.toLowerCase().includes(store$.combobox.query.get().toLowerCase())
    );
  }

  let operatorValues: Row[] | null = null;
  if (operatorField) {
    const allFilters = store$.filter.filters.get();
    const filter = allFilters.find((f) => f.field.name === operatorField.name);
    operatorValues = filter
      ? operator()
          .makeOptionsFrom(filter.field, filter)
          .map((v) => makeRowFromValue(v.id.toString(), filter.field))
      : [];
  }

  return {
    ...state,
    row: state.row ?? (store$.list.selectedRelationField.row.get() as Row),
    rect: state.rect ?? store$.filter.rect.get() ?? rect,
    open: true,
    field: field ?? null,
    placeholder: filterIsOpen ? 'Filter...' : undefined,
    values: operatorValues ??
      filterOptions ??
      dateValues ??
      enumValues ?? [
        ...(noneOption ?? []),
        ...defaultDataSelected,
        ...defaultDataNotSelected,
      ],
    query: store$.combobox.query.get(),
    selected: selectedListField ? selectedOfList || [] : selectedOfFilter ?? [],
    datePickerProps: {
      selected: store$.combobox.datePicker.selected.get(),
      open: store$.combobox.datePicker.open.get(),
    },
    name: field?.name ?? 'filter',
  } satisfies ComboboxState;
});
