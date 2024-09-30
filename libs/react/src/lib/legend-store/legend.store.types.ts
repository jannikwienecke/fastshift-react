import {
  BaseViewConfigManagerInterface,
  ComboxboxItem,
  DataModelNew,
  FieldConfig,
  FilterType,
  Mutation,
  MutationReturnDto,
  QueryRelationalData,
  RecordType,
  RegisteredViews,
  RelationalDataModel,
  Row,
} from '@apps-next/core';
import { Observable } from '@legendapp/state';

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
  query: string;
  values: Row[] | null;
  defaultData: DataModelNew | null;
  fallbackData: Row[];
  selected: Row[];
  open: boolean;
  field: FieldConfig | null;
  tableName: string;
  row: Row | null;
  rect: DOMRect | null;
  id: string | null;
  multiple: boolean;
  searchable: boolean;
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
  showDatePicker: boolean;
  filters: FilterType[];
  selectedIds: string[];
};

export type ComboboxInitPayload = Pick<
  ComboboxState,
  'field' | 'rect' | 'defaultData'
> & {
  selected: Row | Row[] | string;
  multiple?: boolean;
  row?: Row<any> | null;
};

export type LegendStore = {
  // MAIN DATA MODEL
  dataModel: DataModelNew;
  relationalDataModel: RelationalDataModel;

  //   VIEW STATE
  viewConfigManager: BaseViewConfigManagerInterface;
  views: RegisteredViews;

  api?: {
    mutate?: (props: { mutation: Mutation }) => void;
    mutateAsync?: (args: { mutation: Mutation }) => Promise<MutationReturnDto>;
  };

  //   list state
  list: {
    selected: RecordType[];
    selectedRelationField?: {
      field: FieldConfig;
      row?: Row | null;
      rect: DOMRect;
      selected: Row | Row[] | string;
    };
  };

  //   METHODS
  init: (
    data: RecordType[],
    relationalData: QueryRelationalData,
    viewConfigManager: BaseViewConfigManagerInterface,
    views: RegisteredViews
  ) => void;

  createDataModel: (data: RecordType[]) => void;
  createRelationalDataModel: (data: QueryRelationalData) => void;

  //   list methods
  selectListItem: (record: RecordType) => void;
  selectRelationField: (props: {
    field: FieldConfig;
    row: Row;
    selected: Row | Row[];
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
  };

  comboboxInit: (payload: ComboboxInitPayload) => void;
  comboboxSelectValue: (value: Row) => void;
  comboboxClose: () => void;
  comboboxRunSelectMutation: (value: Row) => void;
  comboboxUpdateQuery: (query: string) => void;
  comboboxHandleQueryData: (data: RecordType[]) => void;

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
};

export type StoreFn<T extends keyof LegendStore> = (
  store$: Observable<LegendStore>
) => LegendStore[T];
