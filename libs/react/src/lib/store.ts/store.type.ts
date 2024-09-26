import { RecordType, FieldConfig, Row } from '@apps-next/core';

export type Store = {
  // the items that are selected (one or many)
  selected: RecordType[];

  // selectedRelationalField: FieldConfig - for example, when clicking on a relational field (e.g. Project) inside the list component
  selectedRelationalField: FieldConfig | null;

  edit: {
    isEditing: boolean;
    record: RecordType | null;
  };
  // TODO: Think about this approach. is it best to differentiate if its on the list or somewhere else?
  list?: {
    focusedRelationField?: {
      row: Row;
      field: FieldConfig | null;
      selected: string | Row | Row[];
      rect: DOMRect;
    };
  };
  contextMenu?: {
    row: Row | null;
  };
};

export const DEFAULT_STORE: Store = {
  selected: [],

  selectedRelationalField: null,
  edit: {
    isEditing: false,
    record: null,
  },
};
