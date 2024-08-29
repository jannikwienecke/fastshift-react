import { DataRow, DataItem } from '../query-store';
import { FieldConfig, RecordType } from '../types';

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
    }
  | {
      type: 'SELECT_RELATIONAL_FIELD';
      field: FieldConfig;
      row: DataRow;
      value: DataItem<RecordType>;
      rect: DOMRect;
    }
  | {
      type: 'DESELECT_RELATIONAL_FIELD';
    };
