import { Row } from '../data-model';
import { FieldConfig } from './base.types';

type Icon = React.FC<any>;
export type FilterOperatorType = {
  label:
    | 'is'
    | 'is not'
    | 'is any of'
    | 'is not any of'
    | 'contains'
    | 'does not contain';
  icon?: Icon;
  many?: boolean;
};

export type FilterType =
  | {
      type: 'relation';
      field: FieldConfig;
      operator: FilterOperatorType;
      values: Row[];
    }
  | {
      type: 'primitive';
      field: FieldConfig;
      operator: FilterOperatorType;
      value: Row;
    };

export type FilterItemType = {
  label: string;
  icon?: Icon;
  operator: string;
  value: string;
  name: string;
};
// format to send the filters to the backend
// i need to send the FilterType[] to the backend. Pls suggest a format and a function to convert the FilterType[] to the format
