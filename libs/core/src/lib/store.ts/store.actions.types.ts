import { RecordType } from '../types';

export type StoreAction =
  | {
      type: 'EDIT_RECORD';
      record: RecordType;
    }
  | {
      type: 'SAVE_UPDATED_RECORD';
      record: RecordType;
    }
  | {
      type: 'ADD_NEW_RECORD';
    }
  | {
      type: 'SELECT_RECORD';
      record: RecordType;
    };
