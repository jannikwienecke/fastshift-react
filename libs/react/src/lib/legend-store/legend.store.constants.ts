import {
  BaseViewConfigManagerInterface,
  DataModelNew,
  RegisteredViews,
  RelationalDataModel,
} from '@apps-next/core';
import { LegendStore } from './legend.store.types';

export const DEFAULT_COMBOBOX_STATE: LegendStore['combobox'] = {
  query: '',
  values: [],
  selected: [],
  fallbackData: [],
  open: false,
  field: null,
  tableName: '',
  row: null,
  rect: null,
  id: null,
  defaultData: null,
  multiple: false,
  searchable: true,
};

export const DEFAULT_LEGEND_STORE: Pick<
  LegendStore,
  | 'dataModel'
  | 'views'
  | 'viewConfigManager'
  | 'list'
  | 'relationalDataModel'
  | 'combobox'
> = {
  dataModel: {} as DataModelNew,
  views: {} as RegisteredViews,
  viewConfigManager: {} as BaseViewConfigManagerInterface,
  relationalDataModel: {} as RelationalDataModel,
  combobox: DEFAULT_COMBOBOX_STATE,
  list: {
    selected: [],
  },
};
