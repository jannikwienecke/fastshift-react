import {
  ComboxboxItem,
  FieldConfig,
  RecordType,
  Row,
  getRelationTableName,
  makeNoneOption,
  makeRow,
  makeRowFromValue,
  t,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import Fuse from 'fuse.js';
import { filterUtil, operator } from '../ui-adapter/filter-adapter';
import { store$ } from './legend.store';
import { DEFAULT_COMBOBOX_STATE } from './legend.store.constants';
import {
  ComboboxStateCommonType,
  MakeComboboxStateProps,
} from './legend.store.types';
import { makeFilterPropsOptions } from './legend.store.derived.filter';

export const comboboxDebouncedQuery$ = observable('');
// items that were selected/deselected in a "session" -> session ends when combobox is closed
export const newSelected$ = observable<Row[]>([]);
export const removedSelected$ = observable<Row[]>([]);
// we need to save which items were selected when the combobox is opened
// so that we can track which items are shown on the top (when adding a new item it should not move to the top. it should stay where it is)
export const initSelected$ = observable<Row[] | null>(null);

export const makeComboboxStateFilterOptions =
  (): MakeComboboxStateProps | null => {
    let filterOptions: Row[] | null = null;
    const query = store$.combobox.query.get();

    const viewFields = store$.viewConfigManager.get().getViewFieldList();
    filterOptions = viewFields.map((field) => {
      return makeRowFromValue(field.name, field);
    });

    const fuse = new Fuse(filterOptions, {
      keys: ['label'],
    });

    const result = fuse.search(store$.combobox.query.get());

    return {
      values: query.length ? result.map((r) => r.item) : filterOptions,
      tableName: '',
      multiple: false,
    };
  };

export const handleRelationalField = (
  field: FieldConfig,
  defaultSelectedProps: RecordType[] | null,
  isFilter: boolean
): MakeComboboxStateProps | null => {
  const debouncedQuery = comboboxDebouncedQuery$.get();
  const tableName = getRelationTableName(field);
  const defaultData = store$.relationalDataModel[tableName]?.get();

  const valuesQuery = store$.combobox.values.get();

  const isOptional = !field.isRequired;
  const isManyToMany = field.relation?.manyToManyTable;
  const noneOption = makeNoneOption(field);
  let valuesToUse = defaultData?.rows ?? [];
  if (valuesQuery !== null && debouncedQuery.length) {
    valuesToUse = valuesQuery ?? [];
  }

  if (isOptional && (!isManyToMany || isFilter)) {
    valuesToUse = [noneOption, ...valuesToUse];
  }

  const removedSelectedIds = removedSelected$.get().map((r) => r.id);
  const newSelectedIds = newSelected$.get().map((r) => r.id);

  const defaultSelected = initSelected$.get() ?? defaultSelectedProps;

  const selectedOfList = defaultData?.rows.filter((r) => {
    const isInDefault = defaultSelected?.find?.((s) => s['id'] === r['id']);
    const isInNewSelected = newSelectedIds.includes(r.id.toString());
    const isInRemovedSelected = removedSelectedIds.includes(r.id.toString());

    if (isInRemovedSelected) return false;
    if (isInDefault || isInNewSelected) return true;

    return false;
  });

  if (initSelected$.get() === null) {
    initSelected$.set(selectedOfList || []);
  }

  const defaultDataSelected = valuesToUse.filter((row) =>
    defaultSelected?.find?.((s) => s['id'] === row['id'])
  );

  const defaultDataNotSelected = valuesToUse.filter(
    (row) => !defaultDataSelected.find((s) => s.id === row.id)
  );

  const valuesToUseSorted = [...defaultDataSelected, ...defaultDataNotSelected];

  return {
    values: valuesToUseSorted,
    tableName: tableName,
    multiple: true,
    selected: selectedOfList,
  };
};

export const makeComboboxStateFilterValuesEnum = (
  field: FieldConfig
): MakeComboboxStateProps | null => {
  const query = store$.combobox.query.get();
  if (!field?.enum) return null;

  const fuse = new Fuse(field.enum.values, {
    keys: ['name'],
  });

  const filteredValues = fuse.search(query).map((r) => r.item);

  const values = query.length ? filteredValues : field.enum.values;
  const enumValues = values.map((v) => makeRowFromValue(v.name, field));

  return {
    values: enumValues,
    tableName: '',
    multiple: true,
  };
};

export const makeComboboxStateFilterValuesBoolean = (
  field: FieldConfig
): MakeComboboxStateProps | null => {
  const query = store$.combobox.query.get();
  if (field?.type !== 'Boolean') return null;

  const allValues = [
    makeRow('true', 'true', true, field),
    makeRow('false', 'false', false, field),
  ];

  const fuse = new Fuse(allValues, {
    keys: ['label'],
  });

  const values = query.length
    ? fuse.search(query).map((r) => r.item)
    : allValues;

  return {
    values: values,
    tableName: '',
    multiple: false,
  };
};

export const makeComboboxStateFilterValuesDate = (
  field: FieldConfig,
  getOptions: (query: string) => ComboxboxItem[]
): MakeComboboxStateProps | null => {
  if (field?.type !== 'Date') return null;

  const values = getOptions(store$.combobox.query.get()).map((v) =>
    makeRowFromValue(v.id.toString(), field)
  );

  return {
    values: values,
    tableName: '',
    multiple: false,
  };
};

export const makeComboboxStateFilterValuesDatePicker = (
  field: FieldConfig
): MakeComboboxStateProps | null => {
  if (field?.type !== 'Date') return null;

  return {
    values: [],
    tableName: '',
    multiple: false,
    datePickerProps: {
      selected: store$.combobox.datePicker.selected.get(),
      open: store$.combobox.datePicker.open.get(),
    },
  };
};

export const makeComboboxStateFilterValuesOperator = (
  field: FieldConfig
): MakeComboboxStateProps | null => {
  if (!field) return null;

  const allFilters = store$.filter.filters.get();
  const filter = allFilters.find((f) => f.field.name === field.name);
  const operatorValues = filter
    ? operator()
        .makeOptionsFrom(filter.field, filter)
        .map((v) => makeRowFromValue(v.id.toString(), filter.field))
    : [];

  return {
    values: operatorValues,
    tableName: '',
    multiple: false,
  };
};

export const getSharedStateFilter = (): ComboboxStateCommonType => {
  const selectedFilterField = store$.filter.selectedField.get();

  const selectedOfFilter = getDefaultSelectedFilter();

  const stateShared: ComboboxStateCommonType = {
    rect: store$.filter.rect.get(),
    searchable: true,
    name: 'filter',
    isNewState: true,
    open: true,
    query: store$.combobox.query.get(),
    field: selectedFilterField,
    selected: selectedOfFilter,
    row: null,
    placeholder:
      makeFilterPropsOptions.placeholder.get() ??
      t('filter.button.placeholder'),
  };

  return stateShared;
};

export const getSharedStateList = (): ComboboxStateCommonType => {
  const selectedRelationField = store$.list.selectedRelationField.get();
  if (!selectedRelationField?.row) return DEFAULT_COMBOBOX_STATE;

  const stateShared: ComboboxStateCommonType = {
    rect: selectedRelationField.rect,
    searchable: true,
    name: selectedRelationField?.field?.name ?? 'list-edit',
    isNewState: true,
    open: true,
    query: store$.combobox.query.get(),
    field: selectedRelationField.field,
    selected: getDefaultSelectedList(),
    row: selectedRelationField.row,
  };

  return stateShared;
};

export const getDefaultSelectedFilter = (): Row[] => {
  const selectedFilterField = store$.filter.selectedField.get();
  if (!selectedFilterField) return [];
  const filter = store$.filter.filters
    .get()
    .find((f) => f.field === selectedFilterField);
  const selectedOfFilter = filter ? filterUtil().getValues(filter) : null;

  return (
    selectedOfFilter?.map((s) => makeRowFromValue(s.id, selectedFilterField)) ??
    []
  );
};

export const getDefaultSelectedList = (): Row[] => {
  const selectedRelationField = store$.list.selectedRelationField.get();
  const tableName = selectedRelationField?.field?.name;

  if (!tableName || !selectedRelationField?.row) return [];

  const selected = selectedRelationField?.row?.raw?.[tableName] as RecordType[];
  if (!Array.isArray(selected)) return [];

  return selected?.map((s) =>
    makeRowFromValue(s['id'], selectedRelationField.field)
  );
};
