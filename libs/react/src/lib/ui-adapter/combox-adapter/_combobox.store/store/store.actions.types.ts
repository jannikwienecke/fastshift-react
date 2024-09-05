import { Row } from '@apps-next/core';
import { ComboboxInitPayload } from './store.type';

export type ComboboxStoreAction =
  | {
      type: 'CLOSE';
    }
  | {
      type: 'SELECT_VALUE';
      payload: Row;
    }
  | {
      type: 'UPDATE_QUERY';
      payload: string;
    }
  | {
      type: 'INITIALIZE';
      payload: ComboboxInitPayload;
    }
  | {
      type: 'HANDLE_QUERY_DATA';
      data: Row[];
    };
