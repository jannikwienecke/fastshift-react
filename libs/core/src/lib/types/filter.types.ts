import { Row } from '../data-model';
import { FieldConfig, RecordType } from './base.types';

type Icon = React.FC<any>;
export type FilterOperatorType = {
  label:
    | 'is'
    | 'is not'
    | 'is any of'
    | 'is not any of'
    | 'contains'
    | 'does not contain'
    | 'before'
    | 'after'
    | 'within';
  icon?: Icon;
  many?: boolean;
};

export type FilterPrimitiveType = {
  type: 'primitive';
  field: FieldConfig;
  operator: FilterOperatorType;
  value: Row;
  date?: FilterDateType | null;
};

export type FilterRelationType = {
  type: 'relation';
  field: FieldConfig;
  operator: FilterOperatorType;
  values: Row[];
};

export type FilterType = FilterRelationType | FilterPrimitiveType;

export type ContextMenuState = {
  rect: DOMRect | null;
  row: Row | null;
};

export type ContextMenuFieldItem = {
  options: Row[] | null;
  selected: Row[] | null;
  value: Row;
  Icon?: Icon;
  onSelectOption: (row: Row) => Promise<void>;
  onCheckOption: (row: Row) => Promise<void>;
} & FieldConfig;

export type ContextMenuUiOptions = {
  isOpen?: boolean;
  onClose: () => void;
  fields: ContextMenuFieldItem[] | null;
  renderOption: (row: Row, field: ContextMenuFieldItem) => JSX.Element;
  renderField: (field: ContextMenuFieldItem) => JSX.Element;
} & ContextMenuState;

// export type
export type DisplayOptionsUiType = {
  isOpen: boolean;
  showEmptyGroups: boolean;
  viewType: {
    type: 'list' | 'board';
  };
  sorting: {
    isOpen: boolean;
    field?: FieldConfig;
    order?: 'asc' | 'desc';
    rect: DOMRect | null;
    label?: string;
  };
  grouping: {
    isOpen: boolean;
    field?: FieldConfig;
    rect: DOMRect | null;
    label?: string;
  };
  viewField: {
    selected: string[];
    allFields: string[];
  };
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

export type FilterDateType = {
  operator:
    | 'less than'
    | 'less than or equal to'
    | 'greater than'
    | 'greater than or equal to'
    | 'equal to'
    | 'not equal to';
  value?: number | string;
  unit:
    | 'day'
    | 'days'
    | 'week'
    | 'month'
    | 'year'
    | 'today'
    | 'tomorrow'
    | 'yesterday'
    | 'weeks'
    | 'months'
    | 'quarter'
    | 'iso-date';
};
