import {
  BaseViewConfigManagerInterface,
  ComboxboxItem,
  CommandbarProps,
  ContextMenuState,
  ContinueCursor,
  DataModelNew,
  DisplayOptionsUiType,
  DisplayOptionsViewField,
  FieldConfig,
  FilterType,
  MutationDto,
  MutationHandlerErrorType,
  MutationReturnDto,
  QueryRelationalData,
  RecordType,
  RegisteredViews,
  RelationalDataModel,
  Row,
  TranslationKeys,
  UiViewConfig,
} from '@apps-next/core';
import { Observable } from '@legendapp/state';
import { PaginationOptions } from 'convex/server';

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
  isFetching: boolean;
  isFetched: boolean;
  isDone: boolean;
  reset?: boolean;
};

export type LegendStore = {
  // MAIN DATA MODEL
  dataModel: DataModelNew;
  relationalDataModel: RelationalDataModel;
  uiViewConfig: UiViewConfig;

  // pagination options
  paginateOptions: PaginationOptions;

  fetchMore: FetchMoreOptions;

  //   VIEW STATE
  viewConfigManager: BaseViewConfigManagerInterface;
  views: RegisteredViews;

  api?: {
    mutate?: (args: MutationDto) => void;
    mutateAsync?: (args: MutationDto) => Promise<MutationReturnDto>;
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
  } & Omit<
    CommandbarProps,
    'onClose' | 'onSelect' | 'onClose' | 'onInputChange'
  >;

  //   METHODS
  init: (
    data: RecordType[],
    relationalData: QueryRelationalData,
    viewConfigManager: BaseViewConfigManagerInterface,
    views: RegisteredViews,
    uiViewConfig: UiViewConfig
  ) => void;

  createDataModel: (data: RecordType[]) => void;
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

  selectRowsMutation: (props: {
    field: FieldConfig;
    row: Row;
    existingRows: Row[];
    checkedRow: Row;
  }) => void;
  updateRecordMutation: (props: {
    field: FieldConfig;
    row: Row;
    valueRow: Row;
  }) => void;
  deleteRecordMutation: (
    props: { row: Row },
    onSuccess?: () => void,
    onError?: (message: string) => void
  ) => void;

  // commandbar
  commandbarOpen: () => void;
  commandbarClose: () => void;
  commandbarUpdateQuery: (query: string) => void;
  commandbarSelectItem: (item: ComboxboxItem) => void;
  commandbarSetValue: (value: ComboxboxItem) => void;

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
};

export type StoreFn<T extends keyof LegendStore> = (
  store$: Observable<LegendStore>
) => LegendStore[T];
