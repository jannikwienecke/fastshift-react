import {
  ComboxboxItem,
  FieldConfig,
  NO_GROUPING_FIELD,
  NO_SORTING_FIELD,
  RecordType,
  Row,
  getRelationTableName,
  makeNoneOption,
  makeRow,
  makeRowFromField,
  makeRowFromValue,
  t,
  translateField,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import Fuse from 'fuse.js';
import { filterUtil, operator } from '../ui-adapter/filter-adapter';
import { store$ } from './legend.store';
import { DEFAULT_COMBOBOX_STATE } from './legend.store.constants';
import { makeFilterPropsOptions } from './legend.store.derived.filter';
import {
  ComboboxStateCommonType,
  MakeComboboxStateProps,
} from './legend.store.types';

export const comboboxDebouncedQuery$ = observable('');
// items that were selected/deselected in a "session" -> session ends when combobox is closed
export const newSelected$ = observable<Row[]>([]);
export const removedSelected$ = observable<Row[]>([]);
// we need to save which items were selected when the combobox is opened
// so that we can track which items are shown on the top (when adding a new item it should not move to the top. it should stay where it is)
export const initSelected$ = observable<Row[] | null>(null);

export const getViewFieldsOptions = (): MakeComboboxStateProps | null => {
  let filterOptions: Row[] | null = null;
  const query = store$.combobox.query.get();

  const viewFields = store$.viewConfigManager.get().getViewFieldList();

  filterOptions = viewFields.map((field) => {
    return makeRow(field.name, translateField(t, field), field.name, field);
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

export const makeComboboxStateSortingOptions =
  (): MakeComboboxStateProps | null => {
    const props = getViewFieldsOptions();
    if (!props) return null;

    let values = [...(props.values || [])];
    values = [...values, makeRowFromField(NO_SORTING_FIELD)];

    const showDeleted = store$.displayOptions.showDeleted.get();

    const softDeleteField =
      store$.viewConfigManager.viewConfig.mutation.softDeleteField.get();

    values = values.filter((v) => {
      if (showDeleted) return true;
      if (v.id === softDeleteField) return false;

      return true;
    });

    return {
      ...props,
      values,
    };
  };

export const makeComboboxStateGroupingOptions =
  (): MakeComboboxStateProps | null => {
    const props = getViewFieldsOptions();
    if (!props) return null;

    const fieldTypesToIgnore = ['Date', 'String'];

    let values = [...(props.values || [])]
      .filter((v) => v.id !== '_creationTime')
      .filter((v) => {
        const field = store$.viewConfigManager
          .get()
          .getFieldBy(v.id.toString());
        if (!field) return true;
        if (fieldTypesToIgnore.includes(field.type)) return false;

        return true;
      });

    values = [...values, makeRowFromField(NO_GROUPING_FIELD)];

    const showDeleted = store$.displayOptions.showDeleted.get();

    const softDeleteField =
      store$.viewConfigManager.viewConfig.mutation.softDeleteField.get();

    values = values.filter((v) => {
      if (showDeleted) return true;
      if (v.id === softDeleteField) return false;

      return true;
    });

    return {
      ...props,
      values,
    };
  };

export const makeComboboxStateFilterOptions =
  (): MakeComboboxStateProps | null => {
    return getViewFieldsOptions();
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

export const makeComboboxStateFilterValuesNumber = (
  field: FieldConfig,
  getOptions: (query: string) => ComboxboxItem[]
): MakeComboboxStateProps | null => {
  if (field?.type !== 'Number') return null;

  // FEATURE [LATER] Similiar to how we handle dates, we should have a way to get the options for numbers
  const values = getOptions(store$.combobox.query.get()).map((v) =>
    makeRowFromValue(v.id.toString(), field)
  );

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

export const getSharedStateSorting = (): ComboboxStateCommonType => {
  // const selectedFilterField = store$.filter.selectedField.get();

  // const selectedOfFilter = getDefaultSelectedFilter();

  const stateShared: ComboboxStateCommonType = {
    rect: store$.displayOptions.sorting.rect.get(),
    searchable: true,
    name: 'sorting',
    isNewState: true,
    open: true,
    query: store$.combobox.query.get(),
    field: null,
    selected: [],
    row: null,
    placeholder:
      makeFilterPropsOptions.placeholder.get() ??
      t('filter.button.placeholder'),
  };

  return stateShared;
};

export const getSharedStateGrouping = (): ComboboxStateCommonType => {
  // const selectedFilterField = store$.filter.selectedField.get();

  // const selectedOfFilter = getDefaultSelectedFilter();

  const stateShared: ComboboxStateCommonType = {
    rect: store$.displayOptions.grouping.rect.get(),
    searchable: true,
    name: 'grouping',
    isNewState: true,
    open: true,
    query: store$.combobox.query.get(),
    field: null,
    selected: [],
    row: null,
    placeholder:
      makeFilterPropsOptions.placeholder.get() ??
      t('filter.button.placeholder'),
  };

  return stateShared;
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
    searchable: selectedRelationField?.field?.enum ? false : true,
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
