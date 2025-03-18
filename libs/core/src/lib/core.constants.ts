import { FieldConfig } from './types';

export const DEFAULT_FETCH_LIMIT_QUERY = 50;
export const DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY = 20;

export const NONE_OPTION = 'none-option';

export const DEFAULT_MAX_ITEMS_GROUPING = 500;

export const INTERNAL_FIELDS = {
  creationTime: {
    fieldName: '_creationTime',
  },
};

export const NO_GROUPING_FIELD: FieldConfig = {
  isList: false,
  name: 'displayOptions.grouping.noGrouping',
  type: 'String',
};

export const NO_SORTING_FIELD: FieldConfig = {
  isList: false,
  name: 'displayOptions.sorting.noSorting',
  type: 'String',
};

export const ifNoneNullElseValue = (value: string) =>
  value === NONE_OPTION ? null : value;
