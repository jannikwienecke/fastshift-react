import { RecordType } from '../types';

export type Store = {
  edit: {
    isEditing: boolean;
    record: RecordType | null;
  };
};

export const DEFAULT_STORE: Store = {
  edit: {
    isEditing: false,
    record: null,
  },
};
