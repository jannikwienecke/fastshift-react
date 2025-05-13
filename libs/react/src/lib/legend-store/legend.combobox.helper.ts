import {
  ComboxboxItem,
  FieldConfig,
  NO_GROUPING_FIELD,
  NO_SORTING_FIELD,
  RecordType,
  Row,
  _filter,
  getEditLabel,
  getFieldLabel,
  getRelationTableName,
  makeData,
  makeNoneOption,
  makeRow,
  makeRowFromField,
  makeRowFromValue,
  t,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import Fuse from 'fuse.js';
import { filterUtil, operator } from '../ui-adapter/filter-adapter';
import { selectState$ } from './legend.select-state';
import { store$ } from './legend.store';
import { DEFAULT_COMBOBOX_STATE } from './legend.store.constants';
import { filterPropsOptions$ } from './legend.store.derived.filter';
import {
  ComboboxStateCommonType,
  MakeComboboxStateProps,
} from './legend.store.types';
import { getViewConfigManager } from './legend.utils';

export const comboboxDebouncedQuery$ = observable('');

export const getViewFieldsOptions = (options?: {
  useEditLabel?: boolean;
  row?: Row | null;
  includeSystemFields?: boolean;
}): MakeComboboxStateProps | null => {
  let filterOptions: Row[] | null = null;

  const query =
    (store$.combobox.query.get() || store$.commandbar.query.get()) ?? '';

  const viewFields = getViewConfigManager().getViewFieldList({
    includeSystemFields: options?.includeSystemFields,
  });

  filterOptions = viewFields.map((field) => {
    const label = options?.useEditLabel
      ? getEditLabel(field, options.row)
      : getFieldLabel(field);

    return makeRow(field.name, label || field.name, field, field);
  });

  const result = _filter(filterOptions, ['label']).withQuery(query);

  return {
    values: query.length ? result : filterOptions,
    tableName: '',
    multiple: false,
  };
};

export const makeComboboxStateSortingOptions =
  (): MakeComboboxStateProps | null => {
    const props = getViewFieldsOptions({ includeSystemFields: true });
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
    const options = getViewFieldsOptions();
    const hideFields = filterPropsOptions$.hideFields.get();
    if (!hideFields || hideFields.length === 0) return options;
    if (!options) return null;

    return {
      ...options,
      values:
        options?.values?.filter((v) => v.id && !hideFields.includes(v.id)) ??
        [],
    };
  };

export const handleRelationalField = (
  field: FieldConfig,
  defaultSelectedProps: RecordType[] | null,
  isFilter: boolean
): MakeComboboxStateProps | null => {
  const debouncedQuery = comboboxDebouncedQuery$.get();
  const tableName = getRelationTableName(field);
  const defaultData = store$.relationalDataModel[tableName]?.get() ?? {
    rows: [],
  };

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

  const state = selectState$.get();
  const initialSelectedFilterRows = state.initialSelectedFilterRows;
  const selectedFilterRows = state.selectedFilterRows;

  const defaultSelected = state.initalRows;

  // if we have filter open -> we might have some filter selected which are not in the default data
  // so we add them to the valuesToUse
  if (state.initialSelectedFilterRows) {
    state.initialSelectedFilterRows.forEach((r) => {
      const hasInValueToUse = valuesToUse.find((v) => v.id === r.id);
      if (!hasInValueToUse) {
        valuesToUse = [...valuesToUse, r];
      }
    });
  }

  const selectedOfList = defaultData?.rows.filter((r) => {
    const isInDefault = state.initalRows?.find?.((s) => s['id'] === r['id']);
    const isRemoved = state.removedRows?.find?.((s) => s['id'] === r['id']);
    const isInNew = state.newRows?.find?.((s) => s['id'] === r['id']);
    const isInSelectedFilterRows = selectedFilterRows?.find?.(
      (s) => s['id'] === r['id']
    );
    const isInInitialSelectedFilterRows = initialSelectedFilterRows?.find?.(
      (s) => s['id'] === r['id']
    );

    if (isInSelectedFilterRows) return true;
    if (isInInitialSelectedFilterRows) return true;
    if (isInNew) return true;
    if (isRemoved) return false;
    if (isInDefault) return true;

    return false;
  });

  const initialButNotInDefault = debouncedQuery.length
    ? []
    : state.initalRows
        .filter((r) => !valuesToUse.find((s) => s.id === r.id))
        .filter(
          (r) => state.removedRows.find((s) => s.id === r.id) === undefined
        );

  const initialButNotInDefaultSelected = debouncedQuery.length
    ? valuesToUse.filter(
        (v) =>
          state.initalRows.find((r) => r.id === v.id) ||
          state.newRows.find((r) => r.id === v.id)
      )
    : initialButNotInDefault.filter(
        (r) => !selectedOfList.find((s) => s.id === r.id)
      );

  const new_ = valuesToUse.concat(initialButNotInDefault);
  const newSelected = selectedOfList.concat(initialButNotInDefaultSelected);

  const defaultDataSelected = new_.filter((row) =>
    defaultSelected?.find?.((s) => s['id'] === row['id'])
  );

  const defaultDataNotSelected = new_.filter(
    (row) => !defaultDataSelected.find((s) => s.id === row.id)
  );

  const valuesToUseSorted = [
    ...defaultDataSelected,
    ...defaultDataNotSelected,
  ].sort((a, b) => {
    const isInFilter = initialSelectedFilterRows?.find?.(
      (s) => s['id'] === a['id']
    );
    const isInFilter2 = initialSelectedFilterRows?.find?.(
      (s) => s['id'] === b['id']
    );

    const isNoneOption = a.id === noneOption.id;
    const isNoneOption2 = b.id === noneOption.id;

    if (isNoneOption && !isNoneOption2) return -1;
    if (!isNoneOption && isNoneOption2) return 1;

    if (isInFilter && !isInFilter2) return -1;
    if (!isInFilter && isInFilter2) return 1;
    return 0;
  });

  return {
    // values: valuesToUseSorted,
    values: valuesToUseSorted.map((v) => {
      return {
        ...v,
        raw: JSON.parse(JSON.stringify(v.raw)),
      };
    }),
    tableName: tableName,
    multiple: field.relation?.manyToManyTable ? true : false,
    selected: newSelected,
    defaultSelected: defaultSelected,
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

  const query =
    (store$.combobox.query.get() || store$.commandbar.query.get()) ?? '';

  const values = getOptions(query).map((v) =>
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
      filterPropsOptions$.placeholder.get() ?? t('filter.button.placeholder'),
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
      filterPropsOptions$.placeholder.get() ?? t('filter.button.placeholder'),
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
      filterPropsOptions$.placeholder.get() ?? t('filter.button.placeholder'),
  };

  return stateShared;
};

export const getSharedStateCommandForm = (): ComboboxStateCommonType => {
  const field = store$.commandform.field.get();

  const row = store$.commandform.row.raw.get();
  const value = row?.[field?.name ?? ''] ?? null;

  const stateShared: ComboboxStateCommonType = {
    rect: store$.commandform.rect.get() ?? null,
    searchable: true,
    name: 'commandform',
    isNewState: true,
    open: true,
    query: store$.combobox.query.get(),
    field: field ?? null,
    selected: Array.isArray(value) ? value : [],
    row: null,
    placeholder:
      filterPropsOptions$.placeholder.get() ?? t('filter.button.placeholder'),
  };

  return stateShared;
};

export const getSharedStateDetailPage = (): ComboboxStateCommonType => {
  const field = store$.detail.selectedField.get();

  const row = store$.detail.row.raw.get();
  const value = row?.[field?.name ?? ''] ?? null;

  const stateShared: ComboboxStateCommonType = {
    rect: store$.detail.rect.get() ?? null,
    searchable: true,
    name: 'detail-page',
    isNewState: true,
    open: true,
    query: store$.combobox.query.get(),
    field: field ?? null,
    selected: Array.isArray(value) ? value : [],
    row: null,
    placeholder:
      filterPropsOptions$.placeholder.get() ?? t('filter.button.placeholder'),
  };

  return stateShared;
};

export const getSharedStateCommandbar = (): ComboboxStateCommonType => {
  const selectedCommandbarField = store$.commandbar.selectedViewField.get();

  const stateShared: ComboboxStateCommonType = {
    rect: null,
    searchable: true,
    name: 'commandbar',
    isNewState: true,
    open: true,
    query: store$.commandbar.query.get() ?? '',
    field: selectedCommandbarField ?? null,
    selected: [],
    row: null,
    placeholder:
      filterPropsOptions$.placeholder.get() ?? t('filter.button.placeholder'),
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

export const getSharedStateSelectState = (): ComboboxStateCommonType => {
  const row = selectState$.parentRow.get();
  const field = selectState$.field.get();
  if (!row || !field) return DEFAULT_COMBOBOX_STATE;

  const stateShared: ComboboxStateCommonType = {
    rect: selectState$.rect.get() ?? null,
    searchable: field?.enum ? false : true,
    name: field?.name ?? 'select-state',
    isNewState: true,
    open: !!selectState$.rect.get(),
    query: store$.combobox.query.get(),
    field: field,
    selected: getDefaultSelectedList(),
    row: row as Row,
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

  return makeData(store$.views.get(), 'tags')(selected).rows;
};
