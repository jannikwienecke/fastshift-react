import { FieldConfig, RecordType, Row } from '@apps-next/core';

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
      type: 'CONTEXT_MENU';
      row: Row;
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
