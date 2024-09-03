import { Row } from '../query-store/data-model';
import { ComboxboxItem, FieldConfig, RecordType } from '../types';

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
      row: Row;
      selected: Row | Row[];
      rect: DOMRect;
    }
  | {
      type: 'DESELECT_RELATIONAL_FIELD';
    }
  | {
      type: 'UPDATE_SELECTED_RELATIONAL_FIELD';
      selected: Row;
    };
