import { observable } from '@legendapp/state';
import { DEFAULT_LEGEND_STORE } from './legend.store.constants';
import { LegendStore } from './legend.store.types';
import {
  comboboxHandleQueryData,
  comboboxInit,
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

export const store$ = observable<LegendStore>({
  ...DEFAULT_LEGEND_STORE,

  init: (...props) => init(store$)(...props),
  createDataModel: (...props) => createDataModel(store$)(...props),
  createRelationalDataModel: (...props) =>
    createRelationalDataModel(store$)(...props),
  //   list methods
  selectListItem: (...props) => listSelect(store$)(...props),
  deselectRelationField: (...props) =>
    listDeselectRelationField(store$)(...props),
  comboboxInit: (...props) => comboboxInit(store$)(...props),
  selectRelationField: (...props) => listSelectRelationField(store$)(...props),
  comboboxSelectValue: (...props) => comboboxSelectValue(store$)(...props),
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
});
