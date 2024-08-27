import { RecordType } from '../types';

export type Store = {
  selected: RecordType[];
  edit: {
    isEditing: boolean;
    record: RecordType | null;
  };
};

export const DEFAULT_STORE: Store = {
  selected: [],
  edit: {
    isEditing: false,
    record: null,
  },
};
