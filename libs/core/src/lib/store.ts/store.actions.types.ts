import { RecordType } from '../types';

export type StoreAction = {
  type: 'EDIT_RECORD';
  record: RecordType;
};
