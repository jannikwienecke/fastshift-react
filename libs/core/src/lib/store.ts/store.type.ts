import { FieldConfig, RecordType } from '../types';

export type Store = {
  // the items that are selected (one or many)
  selected: RecordType[];

  // selectedRelationalField: FieldConfig - for example, when clicking on a relational field (e.g. Project) inside the list component
  selectedRelationalField: FieldConfig | null;

  edit: {
    isEditing: boolean;
    record: RecordType | null;
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
