import {
  BaseViewConfigManagerInterface,
  DataModelNew,
  FieldConfig,
  QueryRelationalData,
  RecordType,
  RegisteredViews,
  RelationalDataModel,
  Row,
} from '@apps-next/core';
import { Observable } from '@legendapp/state';

type ComboboxState = {
  query: string;
  values: Row[];
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

export type ComboboxInitPayload = Pick<
  ComboboxState,
  'field' | 'rect' | 'defaultData'
> & {
  selected: Row | Row[] | string;
  multiple?: boolean;
  row?: Row;
};

export type LegendStore = {
  // MAIN DATA MODEL
  dataModel: DataModelNew;
  relationalDataModel: RelationalDataModel;

  //   VIEW STATE
  viewConfigManager: BaseViewConfigManagerInterface;
  views: RegisteredViews;

  //   list state
  list: {
    selected: RecordType[];
    selectedRelationField?: {
      field: FieldConfig;
      row: Row;
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
  combobox: ComboboxState;

  // combobox methods
  comboboxInit: (payload: ComboboxInitPayload) => void;
  comboboxSelectValue: (value: Row) => void;
  comboboxUpdateQuery: (query: string) => void;
  comboboxHandleQueryData: (data: RecordType[]) => void;
};

export type StoreFn<T extends keyof LegendStore> = (
  store$: Observable<LegendStore>
) => LegendStore[T];
