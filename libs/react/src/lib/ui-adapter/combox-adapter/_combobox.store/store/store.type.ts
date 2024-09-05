import {
  DataModelNew,
  FieldConfig,
  RegisteredViews,
  Row,
} from '@apps-next/core';

export type ComboboxStore = {
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

  registeredViews: RegisteredViews;

  multiple: boolean;

  searchable: boolean;
};

export type ComboboxInitPayload = Pick<
  ComboboxStore,
  'field' | 'row' | 'rect' | 'defaultData' | 'registeredViews'
> & {
  selected: Row | Row[] | string;
};

export const DEFAULT_STORE: ComboboxStore = {
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
  registeredViews: {},
  multiple: false,
  searchable: true,
};
