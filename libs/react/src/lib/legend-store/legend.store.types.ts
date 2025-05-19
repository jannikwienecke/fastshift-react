import {
  BaseViewConfigManagerInterface,
  ComboxboxItem,
  CommandbarProps,
  CommandformItem,
  ContextMenuState,
  ContextMenuUiOptions,
  ContinueCursor,
  DataModelNew,
  DetailRow,
  DetailViewTypeState,
  DisplayOptionsUiType,
  DisplayOptionsUiTypeData,
  DisplayOptionsViewField,
  FieldConfig,
  FilterType,
  MakeListPropsOptions,
  MutationDto,
  MutationHandlerErrorType,
  MutationReturnDto,
  HistoryType,
  QueryRelationalData,
  QueryReturnOrUndefined,
  RecordType,
  RegisteredViews,
  RelationalDataModel,
  Row,
  TranslationKeys,
  UiViewConfig,
  UserStoreCommand,
  UserViewData,
  UserViewForm,
  ViewConfigType,
} from '@apps-next/core';
import { Observable } from '@legendapp/state';
import { QueryClient } from '@tanstack/react-query';
import { PaginationOptions } from 'convex/server';
import { MakeQueryOptions } from '../query-context';

export type InputDialogState = {
  open: boolean;
  title: string;
  className?: string;
  inputList: {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
  }[];
};

export type InputDialogValueDict<T extends RecordType = RecordType> = Partial<
  Record<
    keyof T,
    {
      value: string;
      field?: FieldConfig | null;
    }
  >
>;

export type ComboboxState = {
  values: Row[] | null;
  selected: Row[];
  open: boolean;
  tableName: string;
  multiple: boolean;
  rect: DOMRect | null;
  searchable: boolean;
  name: string;
  isNewState: boolean;
  placeholder?: string;
  query: string;
  datePickerProps?: DatePickerState | null;
  field: FieldConfig | null;
  row: Row | null;
  showCheckboxInList: boolean;
  defaultSelected?: Row[];
};

export type ComboboxStateCommonType = Pick<
  ComboboxState,
  | 'rect'
  | 'searchable'
  | 'name'
  | 'isNewState'
  | 'open'
  | 'placeholder'
  | 'query'
  | 'datePickerProps'
  | 'field'
  | 'selected'
  | 'row'
>;

export type MakeComboboxStateProps = Pick<
  ComboboxState,
  'values' | 'tableName' | 'multiple'
> & {
  selected?: Row[];
  defaultSelected?: Row[];
  datePickerProps?: DatePickerState;
};

export type FilterStore = {
  query: string;
  values: Row[];
  filteredValues: ComboxboxItem[];
  open: boolean;
  tableName: string;
  id: string | null;
  selectedField: FieldConfig | null;
  rect: DOMRect | null;
  selectedOperatorField: FieldConfig | null;
  selectedDateField: FieldConfig | null;
  filters: FilterType[];
  selectedIds: string[];
};

export type DatePickerState = {
  open: boolean;
  selected?: Date;
};

export type FetchMoreOptions = {
  currentCursor: ContinueCursor;
  nextCursor: ContinueCursor;
  isDone: boolean;
};

export type GlobalStore = {
  //
};

export type LegendStore = {
  handleIncomingData: (props: QueryReturnOrUndefined) => void;
  handleIncomingRelationalData: (props: QueryReturnOrUndefined) => void;
  handleIncomingDetailData: (props: QueryReturnOrUndefined) => void;

  state:
    | 'pending'
    | 'initialized'
    | 'fetching-more'
    | 'updating-display-options'
    | 'filter-changed'
    | 'mutating';

  // MAIN DATA MODEL
  dataModel: DataModelNew;
  dataModelBackup: DataModelNew;
  relationalDataModel: RelationalDataModel;
  uiViewConfig: UiViewConfig;

  navigation?: {
    state:
      | { type: 'ready' }
      | { type: 'navigate'; id?: string; view: string; slug?: string }
      | {
          type: 'switch-detail-view';
          state: DetailViewTypeState;
        }
      | {
          type: 'preload-relational-sub-list';
          state: { fieldName: string };
        };
  };

  // pagination options
  paginateOptions: PaginationOptions;

  fetchMore: FetchMoreOptions;

  ignoreNextQueryDict: {
    [key: string]: number;
  };

  //   VIEW STATE
  viewConfigManager: BaseViewConfigManagerInterface;
  views: RegisteredViews;
  userViews: UserViewData[];
  commands: UserStoreCommand[];
  userViewData: UserViewData | undefined;

  viewId: string | null;

  api?: {
    mutate?: (args: MutationDto) => void;
    mutateAsync?: (args: MutationDto) => Promise<MutationReturnDto>;
    queryClient?: QueryClient;
    makeQueryOptions: MakeQueryOptions;
    getUserViewQueryKey?: any[];
  };

  globalQuery: string;
  globalQueryDebounced: string;

  errorDialog: {
    error: MutationHandlerErrorType | null;
  };

  //   list state
  list: {
    rowInFocus?: {
      row: Row | null;
      hover: boolean;
      focus: boolean;
    };
    onClickRelation?: { fn: MakeListPropsOptions['onClickRelation'] };
    selected: RecordType[];
    selectedRelationField?: {
      field: FieldConfig;
      row?: Row | null;
      rect: DOMRect;
    };
  };

  confirmationAlert?: {
    open: true;
    title: TranslationKeys;
    description: TranslationKeys;
    onConfirm: { cb: () => void };
  };

  commandbar?: {
    selectedViewField?: FieldConfig;
    activeItem: ComboxboxItem | null;
    activeRow: Row | null;
  } & Omit<
    CommandbarProps,
    'onClose' | 'onSelect' | 'onClose' | 'onInputChange'
  >;

  //   METHODS
  init: (
    data: RecordType[],
    relationalData: QueryRelationalData,
    continueCursor: ContinueCursor | null,
    isDone: boolean,
    viewConfigManager: BaseViewConfigManagerInterface,
    uiViewConfig: UiViewConfig | undefined,
    commands: UserStoreCommand[],
    userView: UserViewData | undefined,
    viewId: string | null
  ) => void;

  createDataModel: (data: RecordType[], tablename?: string) => void;
  createRelationalDataModel: (data: QueryRelationalData) => void;

  // global query
  globalQueryUpdate: (query: string) => void;
  globalQueryReset: () => void;
  globalFetchMore: () => void;

  //   list methods
  selectListItem: (record: RecordType) => void;
  onContextMenuListItem: (record: RecordType, rect: DOMRect) => void;
  selectRelationField: (props: {
    field: FieldConfig;
    row: Row;
    rect: DOMRect;
  }) => void;
  deselectRelationField: () => void;

  // combobox state
  combobox: {
    values: Row[] | null;
    query: string;
    selected: Row[];
    field: FieldConfig | null;
    multiple: boolean;
    datePicker: DatePickerState | null;
  };

  comboboxSelectValue: (value: Row) => void;
  comboboxClose: () => void;
  comboboxRunSelectMutation: (value: Row, selected: Row[] | null) => void;
  comboboxUpdateQuery: (query: string) => void;
  comboboxHandleQueryData: (data: RecordType[]) => void;
  comboboxSelectDate: (date: Date) => void;
  // filter state
  filter: FilterStore;
  filterOpen: (rect: DOMRect) => void;
  filterClose: () => void;
  filterCloseAll: () => void;
  filterUpdateQuery: (query: string) => void;
  filterSelectFilterType: (selected: ComboxboxItem) => void;
  filterSelectFilterValue: (value: Row) => void;
  filterRemoveFilter: (filter: FilterType) => void;
  filterOpenExisting: (filter: FilterType, rect: DOMRect) => void;
  filterOpenOperator: (filter: FilterType, rect: DOMRect) => void;
  filterSelectFromDatePicker: (date: Date) => void;

  // input dialog state
  inputDialog: {
    valueDict: InputDialogValueDict;
  };
  inputDialogSave: () => void;
  inputDialogClose: () => void;

  //   display options state
  displayOptions: DisplayOptionsUiType;
  displayOptionsOpen: () => void;
  displayOptionsClose: () => void;
  displayOptionsOpenSorting: (rect: DOMRect) => void;
  displayOptionsToggleSorting: () => void;
  displayOptionsOpenGrouping: (rect: DOMRect) => void;
  displayOptionsSelectField: (selected: ComboxboxItem) => void;
  displayOptionsCloseCombobox: () => void;
  displayOptionsSelectViewField: (field: DisplayOptionsViewField) => void;
  displayOptionsToggleShowEmptyGroups: (checked: boolean) => void;
  displayOptionsToggleShowDeleted: (checked: boolean) => void;
  displayOptionsReset: () => void;

  contextMenuState: ContextMenuState;
  contextMenuOpen: (rect: DOMRect, row: RecordType) => void;
  contextMenuClose: () => void;
  contextmenuDeleteRow: (row: Row) => void;
  contextmenuEditRow: (row: Row) => void;
  contextmenuCopyRow: ContextMenuUiOptions['onCopy'];
  contextmenuClickOnField: (field: FieldConfig) => void;

  selectRowsMutation: (props: {
    field: FieldConfig;
    row: Row;
    existingRows: Row[];
    checkedRow: Row;
    newRows: Row[];
    newIds: string[];
    idsToDelete: string[];
  }) => void;
  updateRecordMutation: (
    props: {
      field: FieldConfig;
      row: Row;
      valueRow: Row;
    },
    onSuccess?: () => void,
    onError?: (message: string) => void
  ) => void;
  updateFullRecordMutation: (
    props: {
      row: Row;
      record: RecordType;
      view: ViewConfigType;
      updateGlobalDataModel?: boolean;
    },
    onSuccess?: () => void,
    onError?: (message: string) => void
  ) => void;
  createRecordMutation: (
    props: {
      view: ViewConfigType;
      record: RecordType;
      toast?: boolean;
      updateGlobalDataModel?: boolean;
    },
    onSuccess?: () => void,
    onError?: (message: string) => void
  ) => void;
  deleteRecordMutation: (
    props: { row: Row },
    onSuccess?: () => void,
    onError?: (message: string) => void
  ) => void;

  // views mutations
  updateViewMutation: (
    props: Partial<UserViewData>,
    onSuccess?: () => void
  ) => void;
  updateDetailViewMutation: (props: Partial<UserViewData>) => void;
  createViewMutation: (form: UserViewForm, onSuccess?: () => void) => void;
  saveSubUserView: () => void;

  // commandbar
  commandbarOpen: (row: Row | undefined | null) => void;
  commandbarClose: () => void;
  commandbarOpenWithFieldValue: (field: FieldConfig, row: Row) => void;
  commandbarUpdateQuery: (query: string) => void;
  commandbarSelectItem: (item: ComboxboxItem) => void;
  commandbarSetValue: (value: ComboxboxItem) => void;

  // commandform
  commandformOpen: (
    viewName: string,
    row?: Row,
    defaultRecord?: RecordType
  ) => void;
  commandformClose: () => void;
  commanformSelectRelationalValue: (row: Row) => void;
  commandformChangeInput: (
    field: CommandformItem,
    value: string | boolean,
    isTabField?: boolean
  ) => void;
  commandformSubmit: () => void;

  commandform?: {
    open: false;
    view?: ViewConfigType<any>;
    rect?: DOMRect;
    field?: FieldConfig;
    row?: Row;
    type: 'edit' | 'create';
    // selectedViewField?: FieldConfig;
    // activeItem: ComboxboxItem | null;
  };

  // date picker dialog
  datePickerDialogState: {
    open: boolean;
    selected: Date | null;
    onSubmit?: { fn: (date: Date) => void };
  };
  datePickerDialogOpen: (date?: Date, onSubmit?: (date: Date) => void) => void;
  datePickerDialogClose: () => void;
  datePickerDialogSelectDate: (date: Date) => void;
  datePickerDialogSubmit: () => void;

  openSpecificModal: (
    type:
      | 'commandbar'
      | 'commandform'
      | 'combobox'
      | 'filter'
      | 'displayoptions'
      | 'contextmenu',
    openCb: () => void
  ) => void;

  // user view settings state
  userViewSettings: {
    initialSettings: {
      filters: FilterType[];
      displayOptions: DisplayOptionsUiTypeData;
    } | null;

    hasChanged: boolean;
    open: boolean;
    form?: UserViewForm;
    viewCreated?: {
      name: string;
      slug: string;
    };
    viewUpdated?: {
      name: string;
      slug: string;
    };
  };

  detail?: {
    viewConfigManager: BaseViewConfigManagerInterface;
    row?: Row;
    historyDataOfRow?: HistoryType[];

    detailRow?: DetailRow;
    selectedField?: FieldConfig;
    rect?: DOMRect;
    form: {
      dirtyField?: FieldConfig;
      dirtyValue?: string | number;
      // error?: string;
    };
    parentViewName: string;
    viewType?: DetailViewTypeState;
    activeTabField?: CommandformItem | null;
    useTabsForComboboxQuery?: boolean;
    useTabsFormField?: boolean;
    onClickRelation?: {
      fn: (field: FieldConfig, row: Row, cb: () => void) => void;
    };
  };

  detailpageChangeInput: (
    field: CommandformItem,
    value: string | boolean,
    isTabField?: boolean
  ) => void;
  detailpageBlurInput: (field: CommandformItem, isTabField?: boolean) => void;
  detailpageEnter: (field: CommandformItem, isTabField?: boolean) => void;
};

export type StoreFn<T extends keyof LegendStore> = (
  store$: Observable<LegendStore>
) => LegendStore[T];
