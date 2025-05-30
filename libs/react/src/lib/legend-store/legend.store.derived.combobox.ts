import { observable } from '@legendapp/state';
import { dateUtils } from '../ui-adapter/filter-adapter';
import {
  getDefaultSelectedFilter,
  getDefaultSelectedList,
  getSharedStateCommandbar,
  getSharedStateCommandForm,
  getSharedStateFilter,
  getSharedStateGrouping,
  getSharedStateList,
  getSharedStateSelectState,
  getSharedStateSorting,
  getStateSelectOpenCommand,
  handleRelationalField,
  makeComboboxStateFilterOptions,
  makeComboboxStateFilterValuesBoolean,
  makeComboboxStateFilterValuesDate,
  makeComboboxStateFilterValuesDatePicker,
  makeComboboxStateFilterValuesEnum,
  makeComboboxStateFilterValuesNumber,
  makeComboboxStateFilterValuesOperator,
  makeComboboxStateGroupingOptions,
  makeComboboxStateOpenCommandbar,
  makeComboboxStateSortingOptions,
} from './legend.combobox.helper';
import { selectState$ } from './legend.select-state';
import { store$ } from './legend.store';
import { DEFAULT_COMBOBOX_STATE } from './legend.store.constants';
import { ComboboxState, MakeComboboxStateProps } from './legend.store.types';

export const comboboxStore$ = observable<ComboboxState>(() => {
  const filterIsOpen = store$.filter.open.get();
  const commandbarIsOpen = store$.commandbar.open.get();
  const commandformIsOpen = store$.commandform.open.get();

  const selectState = selectState$.get();
  const isSelectState = !!selectState.field.name;

  const displayOptions = store$.displayOptions.get();
  const displayOptionsSortingIsOpen = displayOptions.sorting.isOpen;
  const displayOptionsGroupingIsOpen = displayOptions.grouping.isOpen;

  const operatorField = store$.filter.selectedOperatorField.get();
  const selectedFilterField = filterIsOpen
    ? store$.filter.selectedField.get()
    : null;
  const selectedCommandbarField = commandbarIsOpen
    ? store$.commandbar.selectedViewField.get()
    : null;

  const selectedCommandformField = commandformIsOpen
    ? store$.commandform.field.get()
    : null;

  const selectedCommandbarTableName = commandbarIsOpen
    ? store$.commandbar.activeOpen.tableName.get()
    : null;

  const selectedListField = store$.list.selectedRelationField.get()?.field;

  const isList = !!store$.list.selectedRelationField.get();
  const isFilter = filterIsOpen;
  const isCommandbar = !!commandbarIsOpen;
  const isCommandform = commandformIsOpen;

  if (
    !isList &&
    !isFilter &&
    !displayOptionsSortingIsOpen &&
    !displayOptionsGroupingIsOpen &&
    !isCommandbar &&
    !isCommandform &&
    !isSelectState &&
    !selectedCommandbarTableName
  )
    return DEFAULT_COMBOBOX_STATE;

  const field =
    isSelectState && !isList
      ? selectState.field
      : isCommandform
      ? selectedCommandformField
      : isCommandbar
      ? selectedCommandbarField
      : isList
      ? selectedListField
      : selectedFilterField ?? null;

  const { showCheckboxInList } =
    store$.viewConfigManager.viewConfig.fields.get()?.[field?.name ?? ''] ?? {};

  const stateSharedFilter = getSharedStateFilter();
  const stateSharedList = getSharedStateList();
  const stateSharedCommandform = getSharedStateCommandForm();

  const stateSharedSorting = getSharedStateSorting();
  const stateSharedGrouping = getSharedStateGrouping();

  const selectedOfFilter = getDefaultSelectedFilter();
  const selectedOfList = getDefaultSelectedList();

  const getDateOptionsList = dateUtils.getOptionsForEdit;
  const getDateOptionsFilter = dateUtils.getOptionsForFilter;

  const multipleFilter = null;
  const multipleList = field?.relation?.manyToManyTable ? true : false;
  const multipleCommanform = selectedCommandformField?.relation?.manyToManyTable
    ? true
    : false;

  const stateShared = selectedCommandbarTableName
    ? getStateSelectOpenCommand()
    : isSelectState && !isList
    ? getSharedStateSelectState()
    : isCommandform
    ? stateSharedCommandform
    : isCommandbar
    ? getSharedStateCommandbar()
    : isList
    ? stateSharedList
    : displayOptionsSortingIsOpen
    ? stateSharedSorting
    : displayOptionsGroupingIsOpen
    ? stateSharedGrouping
    : stateSharedFilter;

  const selected = isList ? selectedOfList : selectedOfFilter;

  const multiple = isCommandform
    ? multipleCommanform
    : isList
    ? multipleList
    : multipleFilter;

  const getDateOptions = isList ? getDateOptionsList : getDateOptionsFilter;

  let options: MakeComboboxStateProps | null = null;

  if (selectedCommandbarTableName) {
    options = makeComboboxStateOpenCommandbar();
  } else if (operatorField) {
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

  const selected_ = options.selected?.length
    ? options.selected
    : stateShared.selected;

  return {
    ...stateShared,
    ...options,
    selected: selected_,
    multiple: multiple === null ? options.multiple : multiple,
    showCheckboxInList: showCheckboxInList === false ? false : !!multiple,
  } satisfies ComboboxState;
});
