import { observable } from '@legendapp/state';
import {
  displayOptionsClose,
  displayOptionsCloseCombobox,
  displayOptionsOpen,
  displayOptionsOpenGrouping,
  displayOptionsOpenSorting,
  displayOptionsReset,
  displayOptionsSelectField,
  displayOptionsSelectViewField,
  displayOptionsToggleShowDeleted,
  displayOptionsToggleShowEmptyGroups,
  displayOptionsToggleSorting,
} from './legend-store.fn.displayOptions';
import {
  contextMenuClose,
  contextmenuDeleteRow,
  contextMenuOpen,
} from './legend.contextmenu.fn';
import {
  deleteRecordMutation,
  selectRowsMutation,
  updateRecordMutation,
} from './legend.mutationts';
import { DEFAULT_LEGEND_STORE } from './legend.store.constants';
import {
  comboboxClose,
  comboboxHandleQueryData,
  comboboxRunSelectMutation,
  comboboxSelectDate,
  comboboxSelectValue,
  comboboxUpdateQuery,
} from './legend.store.fn.combobox';
import {
  filterClose,
  filterCloseAll,
  filterOpen,
  filterOpenExisting,
  filterOpenOperator,
  filterRemoveFilter,
  filterSelectFilterType,
  filterSelectFilterValue,
  filterSelectFromDatePicker,
  filterUpdateQuery,
} from './legend.store.fn.filter';
import {
  createDataModel,
  createRelationalDataModel,
  init,
} from './legend.store.fn.global';
import {
  globalFetchMore,
  globalQueryReset,
  globalQueryUpdate,
} from './legend.store.fn.global-query';
import {
  inputDialogClose,
  inputDialogSave,
} from './legend.store.fn.input-dialog';
import {
  listContextMenuItem,
  listDeselectRelationField,
  listSelect,
  listSelectRelationField,
} from './legend.store.fn.list';
import { LegendStore } from './legend.store.types';
import {
  commandbarClose,
  commandbarOpen,
  commandbarSelectItem,
  commandbarUpdateQuery,
} from './legend.commandbar.fn';

export const store$ = observable<LegendStore>({
  ...DEFAULT_LEGEND_STORE,

  init: (...props) => init(store$)(...props),
  createDataModel: (...props) => createDataModel(store$)(...props),
  createRelationalDataModel: (...props) =>
    createRelationalDataModel(store$)(...props),

  // global query methods
  globalQueryUpdate: (...props) => globalQueryUpdate(store$)(...props),
  globalQueryReset: (...props) => globalQueryReset(store$)(...props),
  globalFetchMore: (...props) => globalFetchMore(store$)(...props),
  //   list methods
  selectListItem: (...props) => listSelect(store$)(...props),
  onContextMenuListItem: (...props) => listContextMenuItem(store$)(...props),
  deselectRelationField: (...props) =>
    listDeselectRelationField(store$)(...props),
  comboboxClose: (...props) => comboboxClose(store$)(...props),
  selectRelationField: (...props) => listSelectRelationField(store$)(...props),
  comboboxSelectValue: (...props) => comboboxSelectValue(store$)(...props),
  comboboxRunSelectMutation: (...props) =>
    comboboxRunSelectMutation(store$)(...props),
  comboboxUpdateQuery: (...props) => comboboxUpdateQuery(store$)(...props),
  comboboxHandleQueryData: (...props) =>
    comboboxHandleQueryData(store$)(...props),
  comboboxSelectDate: (...props) => comboboxSelectDate(store$)(...props),

  // filter methods
  filterOpen: (...props) => filterOpen(store$)(...props),
  filterClose: (...props) => filterClose(store$)(...props),
  filterCloseAll: (...props) => filterCloseAll(store$)(...props),
  filterUpdateQuery: (...props) => filterUpdateQuery(store$)(...props),
  filterSelectFilterType: (...props) =>
    filterSelectFilterType(store$)(...props),
  filterSelectFilterValue: (...props) =>
    filterSelectFilterValue(store$)(...props),
  filterRemoveFilter: (...props) => filterRemoveFilter(store$)(...props),
  filterOpenExisting: (...props) => filterOpenExisting(store$)(...props),
  filterOpenOperator: (...props) => filterOpenOperator(store$)(...props),
  filterSelectFromDatePicker: (...props) =>
    filterSelectFromDatePicker(store$)(...props),

  // input dialog methods
  inputDialogSave: (...props) => inputDialogSave(store$)(...props),
  inputDialogClose: (...props) => inputDialogClose(store$)(...props),

  // display options
  displayOptionsOpen: (...props) => displayOptionsOpen(store$)(...props),
  displayOptionsClose: (...props) => displayOptionsClose(store$)(...props),
  displayOptionsOpenSorting: (...props) =>
    displayOptionsOpenSorting(store$)(...props),
  displayOptionsToggleSorting: (...props) =>
    displayOptionsToggleSorting(store$)(...props),
  displayOptionsSelectField: (...props) =>
    displayOptionsSelectField(store$)(...props),
  displayOptionsOpenGrouping: (...props) =>
    displayOptionsOpenGrouping(store$)(...props),
  displayOptionsCloseCombobox: (...props) =>
    displayOptionsCloseCombobox(store$)(...props),
  displayOptionsSelectViewField: (...props) =>
    displayOptionsSelectViewField(store$)(...props),
  displayOptionsToggleShowEmptyGroups: (...props) =>
    displayOptionsToggleShowEmptyGroups(store$)(...props),
  displayOptionsToggleShowDeleted: (...props) =>
    displayOptionsToggleShowDeleted(store$)(...props),
  displayOptionsReset: (...props) => displayOptionsReset(store$)(...props),

  contextMenuOpen: (...props) => contextMenuOpen(store$)(...props),
  contextMenuClose: (...props) => contextMenuClose(store$)(...props),
  contextmenuDeleteRow: (...props) => contextmenuDeleteRow(store$)(...props),

  selectRowsMutation: (...props) => selectRowsMutation(store$)(...props),
  updateRecordMutation: (...props) => updateRecordMutation(store$)(...props),
  deleteRecordMutation: (...props) => deleteRecordMutation(store$)(...props),
  commandbarOpen: (...props) => commandbarOpen(store$)(...props),
  commandbarClose: (...props) => commandbarClose(store$)(...props),
  commandbarSelectItem: (...props) => commandbarSelectItem(store$)(...props),
  commandbarUpdateQuery: (...props) => commandbarUpdateQuery(store$)(...props),
});
