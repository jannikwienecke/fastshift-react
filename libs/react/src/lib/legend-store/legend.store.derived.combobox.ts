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
  makeComboboxStateFilterValuesRelation,
} from './legend.combobox.helper';
import { store$ } from './legend.store';
import { DEFAULT_COMBOBOX_STATE } from './legend.store.constants';
import { ComboboxState, MakeComboboxStateProps } from './legend.store.types';

export const comboboxStore$ = observable<ComboboxState>(() => {
  const filterIsOpen = store$.filter.open.get();
  const operatorField = store$.filter.selectedOperatorField.get();
  const selectedFilterField = filterIsOpen
    ? store$.filter.selectedField.get()
    : null;
  const selectedListField = store$.list.selectedRelationField.get()?.field;

  const isList = !!store$.list.selectedRelationField.get();
  const isFilter = filterIsOpen;

  if (!isList && !isFilter) return DEFAULT_COMBOBOX_STATE;

  const field = isList ? selectedListField : selectedFilterField ?? null;

  const stateSharedFilter = getSharedStateFilter();
  const stateSharedList = getSharedStateList();

  const selectedOfFilter = getDefaultSelectedFilter();
  const selectedOfList = getDefaultSelectedList();

  const getDateOptionsList = dateUtils.getOptionsForEdit;
  const getDateOptionsFilter = dateUtils.getOptionsForFilter;

  const multipleFilter = null;
  const multipleList = field?.relation?.manyToManyTable ? true : false;

  const stateShared = isList ? stateSharedList : stateSharedFilter;
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
  } else if (field?.relation) {
    options = makeComboboxStateFilterValuesRelation(field, selected);
  } else if (field?.enum) {
    options = makeComboboxStateFilterValuesEnum(field);
  } else if (field?.type === 'Boolean') {
    options = makeComboboxStateFilterValuesBoolean(field);
  } else if (field?.type === 'Date') {
    options = makeComboboxStateFilterValuesDate(field, getDateOptions);
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

// TODO HIER WEITER MACHEN
// fix when select "this week" -> wrong date. Add test after it is fixed
// when change the date of a list to a specific date -> wrong date
