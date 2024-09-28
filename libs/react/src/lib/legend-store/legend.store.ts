import { observable } from '@legendapp/state';
import { DEFAULT_LEGEND_STORE } from './legend.store.constants';
import { LegendStore } from './legend.store.types';

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
  comboboxHandleQueryData,
  comboboxInit,
  comboboxSelectValue,
  comboboxUpdateQuery,
} from './legend.store.fn.combobox';
import { comboboInitialize } from '../field-features/combobox';
import { getRelationTableName } from '@apps-next/core';

export const store$ = observable<LegendStore>({
  ...DEFAULT_LEGEND_STORE,

  combobox: () => {
    const selected = store$.list.selectedRelationField.get();
    if (!selected?.field) {
      return DEFAULT_LEGEND_STORE.combobox;
    }
    const tableName = getRelationTableName(selected?.field);
    const defaultData = store$.relationalDataModel[tableName].get();

    if (store$.combobox.open.get() === false) {
      console.log('INIT', selected.row.id);
      return comboboInitialize(store$.combobox.get(), {
        ...selected,
        defaultData,
      });
    } else {
      return store$.combobox;
    }
  },

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
});
