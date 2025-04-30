import {
  BaseViewConfigManagerInterface,
  DataModelNew,
  DEFAULT_FETCH_LIMIT_QUERY,
  RegisteredViews,
  RelationalDataModel,
  UiViewConfig,
} from '@apps-next/core';
import {
  DatePickerState,
  FilterStore,
  LegendStore,
  ComboboxState,
} from './legend.store.types';
import { PaginationOptions } from 'convex/server';

export const DEFAULT_COMBOBOX_STATE: ComboboxState = {
  values: null,
  selected: [],
  open: false,
  tableName: '',
  multiple: false,
  rect: null,
  searchable: false,
  name: '',
  isNewState: true,
  placeholder: '',
  query: '',
  datePickerProps: null,
  field: null,
  row: null,
  showCheckboxInList: false,
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
  selectedDateField: null,
  filters: [],
  selectedIds: [],
};

export const DEFAULT_DATE_PICKER_STATE: DatePickerState | null = null;

export const DEFAULT_LEGEND_STORE: Pick<
  LegendStore,
  | 'dataModel'
  | 'dataModelBackup'
  | 'views'
  | 'uiViewConfig'
  | 'viewConfigManager'
  | 'list'
  | 'relationalDataModel'
  | 'combobox'
  | 'filter'
  | 'inputDialog'
  | 'globalQuery'
  | 'globalQueryDebounced'
  | 'paginateOptions'
  | 'fetchMore'
  | 'displayOptions'
  | 'contextMenuState'
  | 'errorDialog'
  | 'commandbar'
  | 'commandform'
  | 'datePickerDialogState'
  | 'commands'
  | 'state'
  | 'userViewSettings'
  | 'userViewData'
  | 'viewId'
  | 'userViews'
  | 'ignoreNextQueryDict'
> = {
  state: 'pending',
  dataModel: {} as DataModelNew,
  dataModelBackup: { rows: [] } as DataModelNew,
  views: {} as RegisteredViews,
  userViews: [],
  viewConfigManager: {} as BaseViewConfigManagerInterface,
  relationalDataModel: {} as RelationalDataModel,
  uiViewConfig: {} as UiViewConfig,
  viewId: null,
  paginateOptions: {
    cursor: null,
    numItems: DEFAULT_FETCH_LIMIT_QUERY,
  } as PaginationOptions,
  errorDialog: {
    error: null,
  },
  ignoreNextQueryDict: {},
  fetchMore: {
    currentCursor: {
      position: null,
      cursor: null,
    },
    nextCursor: {
      position: null,
      cursor: null,
    },
    // isFetching: true,
    // isFetched: false,
    isDone: false,
  },
  globalQuery: '',
  globalQueryDebounced: '',
  combobox: {
    values: null,
    query: '',
    selected: [],
    field: null,
    multiple: false,
    datePicker: null,
  },
  filter: DEFAULT_FILTER_STATE,
  list: {
    selected: [],
  },
  inputDialog: {
    valueDict: {},
  },
  commands: [],
  displayOptions: {
    // showEmptyGroups?,
    softDeleteEnabled: false,
    showDeleted: false,
    isOpen: false,
    viewType: {
      type: 'list',
    },
    sorting: {
      isOpen: false,
      rect: null,
    },
    viewField: {
      visible: [],
      allFields: [],
    },
    grouping: {
      isOpen: false,
      rect: null,
    },
  },
  contextMenuState: {
    rect: null,
    row: null,
  },

  commandbar: undefined,
  commandform: undefined,

  datePickerDialogState: {
    open: false,
    selected: null,
  },

  userViewSettings: {
    initialSettings: null,
    open: false,
    hasChanged: false,
  },

  userViewData: undefined,
};
