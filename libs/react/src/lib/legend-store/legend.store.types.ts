import {
  BaseViewConfigManagerInterface,
  ComboxboxItem,
  ContinueCursor,
  DataModelNew,
  DisplayOptionsUiType,
  DisplayOptionsViewField,
  FieldConfig,
  FilterType,
  MutationDto,
  MutationReturnDto,
  QueryRelationalData,
  RecordType,
  RegisteredViews,
  RelationalDataModel,
  Row,
  ViewFieldsConfig,
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
  viewFieldsConfig: ViewFieldsConfig;

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

  //   list state
  list: {
    selected: RecordType[];
    selectedRelationField?: {
      field: FieldConfig;
      row?: Row | null;
      rect: DOMRect;
    };
  };

  //   METHODS
  init: (
    data: RecordType[],
    relationalData: QueryRelationalData,
    viewConfigManager: BaseViewConfigManagerInterface,
    views: RegisteredViews,
    viewFieldsConfig: ViewFieldsConfig
  ) => void;

  createDataModel: (data: RecordType[]) => void;
  createRelationalDataModel: (data: QueryRelationalData) => void;

  // global query
  globalQueryUpdate: (query: string) => void;
  globalQueryReset: () => void;
  globalFetchMore: () => void;

  //   list methods
  selectListItem: (record: RecordType) => void;
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
  comboboxRunSelectMutation: (value: Row, selected: Row[] | Row) => void;
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
  displayOptionsOpenGrouping: (rect: DOMRect) => void;
  displayOptionsSelectField: (selected: ComboxboxItem) => void;
  displayOptionsCloseCombobox: () => void;
  displayOptionsSelectViewField: (field: DisplayOptionsViewField) => void;
  displayOptionsToggleShowEmptyGroups: (checked: boolean) => void;
};

export type StoreFn<T extends keyof LegendStore> = (
  store$: Observable<LegendStore>
) => LegendStore[T];
