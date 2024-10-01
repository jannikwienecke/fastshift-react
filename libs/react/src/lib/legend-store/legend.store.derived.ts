import {
  RecordType,
  Row,
  getRelationTableName,
  makeRow,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { comboboInitialize } from '../field-features/combobox';
import { filterUtil } from '../ui-adapter/filter-adapter';
import { store$ } from './legend.store';
import { DEFAULT_COMBOBOX_STATE } from './legend.store.constants';
import { ComboboxState } from './legend.store.types';

export const comboboxDebouncedQuery$ = observable('');
// items that were selected/deselected in a "session" -> session ends when combobox is closed
export const newSelected$ = observable<Row[]>([]);
export const removedSelected$ = observable<Row[]>([]);
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
  const query = comboboxDebouncedQuery$.get().toLowerCase();
  const filterValues = store$.filter.values.get();

  const defaultSelected =
    initSelected$.get() ?? (row?.raw?.[tableName] as RecordType[] | null);

  const state = comboboInitialize({
    field,
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

  const theValues = filterValues.length
    ? filterValues
    : values !== null && comboboxDebouncedQuery$.get().length
    ? values
    : defaultData?.rows ?? values ?? [];

  const defaultDataSelected = theValues.filter((row) =>
    defaultSelected?.find?.((s) => s.id === row.id)
  );

  const defaultDataNotSelected = theValues.filter(
    (row) => !defaultDataSelected.find((s) => s.id === row.id)
  );

  const selectedOfList = defaultData?.rows.filter((r) => {
    const isInDefault = defaultSelected?.find?.((s) => s.id === r.id);
    const isInNewSelected = newSelectedIds.includes(r.id.toString());
    const isInRemovedSelected = removedSelectedIds.includes(r.id.toString());

    if (isInRemovedSelected) return false;
    if (isInDefault || isInNewSelected) return true;

    return false;
  });

  if (initSelected$.get() === null && defaultSelected) {
    initSelected$.set(selectedOfList ?? []);
  }

  return {
    ...state,
    rect: state.rect ?? store$.filter.rect.get(),
    open: !store$.filter.showDatePicker.get() ? true : false,
    field,
    values: enumValues ?? [...defaultDataSelected, ...defaultDataNotSelected],
    query: store$.combobox.query.get(),
    selected: selectedOfFilter ?? selectedOfList ?? [],
  } satisfies ComboboxState;
});
