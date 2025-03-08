import { observable } from '@legendapp/state';
import { dateUtils } from '../ui-adapter/filter-adapter';
import {
  getDefaultSelectedFilter,
  getDefaultSelectedList,
  getSharedStateFilter,
  getSharedStateList,
  makeComboboxStateFilterOptions,
  makeComboboxStateFilterValuesBoolean,
  makeComboboxStateFilterValuesDate,
  makeComboboxStateFilterValuesDatePicker,
  makeComboboxStateFilterValuesEnum,
  makeComboboxStateFilterValuesOperator,
  handleRelationalField,
  makeComboboxStateSortingOptions,
  getSharedStateSorting,
  makeComboboxStateGroupingOptions,
  getSharedStateGrouping,
  makeComboboxStateFilterValuesNumber,
} from './legend.combobox.helper';
import { store$ } from './legend.store';
import { DEFAULT_COMBOBOX_STATE } from './legend.store.constants';
import { ComboboxState, MakeComboboxStateProps } from './legend.store.types';

export const comboboxStore$ = observable<ComboboxState>(() => {
  const filterIsOpen = store$.filter.open.get();

  const displayOptions = store$.displayOptions.get();
  const displayOptionsSortingIsOpen = displayOptions.sorting.isOpen;
  const displayOptionsGroupingIsOpen = displayOptions.grouping.isOpen;

  const operatorField = store$.filter.selectedOperatorField.get();
  const selectedFilterField = filterIsOpen
    ? store$.filter.selectedField.get()
    : null;
  const selectedListField = store$.list.selectedRelationField.get()?.field;

  const isList = !!store$.list.selectedRelationField.get();
  const isFilter = filterIsOpen;

  if (
    !isList &&
    !isFilter &&
    !displayOptionsSortingIsOpen &&
    !displayOptionsGroupingIsOpen
  )
    return DEFAULT_COMBOBOX_STATE;

  const field = isList ? selectedListField : selectedFilterField ?? null;

  const stateSharedFilter = getSharedStateFilter();
  const stateSharedList = getSharedStateList();
  const stateSharedSorting = getSharedStateSorting();
  const stateSharedGrouping = getSharedStateGrouping();

  const selectedOfFilter = getDefaultSelectedFilter();
  const selectedOfList = getDefaultSelectedList();

  const getDateOptionsList = dateUtils.getOptionsForEdit;
  const getDateOptionsFilter = dateUtils.getOptionsForFilter;

  const multipleFilter = null;
  const multipleList = field?.relation?.manyToManyTable ? true : false;

  const stateShared = isList
    ? stateSharedList
    : displayOptionsSortingIsOpen
    ? stateSharedSorting
    : displayOptionsGroupingIsOpen
    ? stateSharedGrouping
    : stateSharedFilter;

  const selected = isList ? selectedOfList : selectedOfFilter;
  const multiple = isList ? multipleList : multipleFilter;
  const getDateOptions = isList ? getDateOptionsList : getDateOptionsFilter;

  let options: MakeComboboxStateProps | null = null;

  if (operatorField) {
    options = makeComboboxStateFilterValuesOperator(operatorField);
  } else if (field && store$.combobox.datePicker.open.get()) {
    options = makeComboboxStateFilterValuesDatePicker(field);
  } else if (!field && isFilter) {
    options = makeComboboxStateFilterOptions();
  } else if (!field && displayOptionsSortingIsOpen) {
    options = makeComboboxStateSortingOptions();
  } else if (!field && displayOptionsGroupingIsOpen) {
    options = makeComboboxStateGroupingOptions();
  } else if (field?.relation) {
    options = handleRelationalField(field, selected, isFilter);
  } else if (field?.enum) {
    options = makeComboboxStateFilterValuesEnum(field);
  } else if (field?.type === 'Boolean') {
    options = makeComboboxStateFilterValuesBoolean(field);
  } else if (field?.type === 'Date') {
    options = makeComboboxStateFilterValuesDate(field, getDateOptions);
  } else if (field?.type === 'Number') {
    options = makeComboboxStateFilterValuesNumber(field, getDateOptions);
  }

  if (!options) return DEFAULT_COMBOBOX_STATE;

  return {
    ...stateShared,
    ...options,
    selected: options.selected?.length
      ? options.selected
      : stateShared.selected,
    multiple: multiple === null ? options.multiple : multiple,
  } satisfies ComboboxState;
});
