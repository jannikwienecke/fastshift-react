import { Row } from '../data-model';
import { FieldConfig } from './base.types';

type Icon = React.FC<any>;
export type FilterOperatorTypeRelation = {
  label: 'is any of' | 'is not' | 'is';
  icon?: Icon;
};

export type FilterOperatorTypePrimitive = {
  label: 'contains' | 'does not contain' | 'is';
  icon?: Icon;
};

export type FilterType =
  | {
      type: 'relation';
      field: FieldConfig;
      operator: FilterOperatorTypeRelation;
      values: Row[];
    }
  | {
      type: 'primitive';
      field: FieldConfig;
      operator: FilterOperatorTypePrimitive;
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
