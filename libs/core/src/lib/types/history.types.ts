import React from 'react';
import { RecordType } from './base.types';

export type HistoryType = {
  creator: {
    id: string;
    label: string;
    icon?: React.FC<any>;
  };

  tableName: string;
  record: RecordType & { id: string };
  recordLabel: string;

  timestamp: number;
  changed:
    | {
        type: 'created';
        fieldName: '';
        label: '';
        id: '';
        oldValue: null;
        newValue: null;
      }
    | {
        type: 'added';
        fieldName: string;
        label: string;
        id: string;
        oldValue: null;
        newValue: null;
      }
    | {
        type: 'added-to';
        fieldName: string;
        label: string;
        id: string;
        oldValue: string;
        newValue: string;
      }
    | {
        type: 'removed-from';
        fieldName: string;
        label: string;
        id: string;
        oldValue: string;
        newValue: '';
      }
    | {
        type: 'removed';
        fieldName: string;
        label: string;
        id: string;
        oldValue: null;
        newValue: null;
      }
    | {
        type: 'changed';
        fieldName: string;
        label: '';
        id: '';
        oldValue: string | RecordType | null;
        newValue: string | RecordType | null;
      };
};
