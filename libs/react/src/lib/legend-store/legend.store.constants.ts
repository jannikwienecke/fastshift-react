import {
  BaseViewConfigManagerInterface,
  DataModelNew,
  RegisteredViews,
  RelationalDataModel,
} from '@apps-next/core';
import { ComboboxState, FilterStore, LegendStore } from './legend.store.types';

export const DEFAULT_COMBOBOX_STATE: ComboboxState = {
  query: '',
  values: null,
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

export const DEFAULT_FILTER_STATE: FilterStore = {
  query: '',
  values: [],
  filteredValues: [],
  open: false,
  tableName: '',
  id: null,
  selectedField: null,
  rect: null,
  selectedOperatorField: null,
  showDatePicker: false,
  selectedDateField: null,
  filters: [],
};

export const DEFAULT_LEGEND_STORE: Pick<
  LegendStore,
  | 'dataModel'
  | 'views'
  | 'viewConfigManager'
  | 'list'
  | 'relationalDataModel'
  | 'combobox'
  | 'filter'
  | 'inputDialog'
> = {
  dataModel: {} as DataModelNew,
  views: {} as RegisteredViews,
  viewConfigManager: {} as BaseViewConfigManagerInterface,
  relationalDataModel: {} as RelationalDataModel,
  combobox: {
    values: null,
    query: '',
    selected: [],
    field: null,
    multiple: false,
  },
  filter: DEFAULT_FILTER_STATE,
  list: {
    selected: [],
  },
  inputDialog: {
    valueDict: {},
  },
};
