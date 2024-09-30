import { observable } from '@legendapp/state';
import { DEFAULT_LEGEND_STORE } from './legend.store.constants';
import { LegendStore } from './legend.store.types';
import {
  comboboxClose,
  comboboxHandleQueryData,
  comboboxInit,
  comboboxRunSelectMutation,
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
  listDeselectRelationField,
  listSelect,
  listSelectRelationField,
} from './legend.store.fn.list';
import {
  inputDialogClose,
  inputDialogSave,
} from './legend.store.fn.input-dialog';
import {
  globalQueryReset,
  globalQueryUpdate,
} from './legend.store.fn.global-query';

export const store$ = observable<LegendStore>({
  ...DEFAULT_LEGEND_STORE,

  init: (...props) => init(store$)(...props),
  createDataModel: (...props) => createDataModel(store$)(...props),
  createRelationalDataModel: (...props) =>
    createRelationalDataModel(store$)(...props),

  // global query methods
  globalQueryUpdate: (...props) => globalQueryUpdate(store$)(...props),
  globalQueryReset: (...props) => globalQueryReset(store$)(...props),

  //   list methods
  selectListItem: (...props) => listSelect(store$)(...props),
  deselectRelationField: (...props) =>
    listDeselectRelationField(store$)(...props),
  comboboxInit: (...props) => comboboxInit(store$)(...props),
  comboboxClose: (...props) => comboboxClose(store$)(...props),
  selectRelationField: (...props) => listSelectRelationField(store$)(...props),
  comboboxSelectValue: (...props) => comboboxSelectValue(store$)(...props),
  comboboxRunSelectMutation: (...props) =>
    comboboxRunSelectMutation(store$)(...props),
  comboboxUpdateQuery: (...props) => comboboxUpdateQuery(store$)(...props),
  comboboxHandleQueryData: (...props) =>
    comboboxHandleQueryData(store$)(...props),

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
});
