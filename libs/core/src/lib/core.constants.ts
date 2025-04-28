import { FieldConfig } from './types';

export const DEFAULT_FETCH_LIMIT_QUERY = 50;
export const DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY = 10;
export const DEFAULT_LOCAL_MODE_LIMIT = 500;

export const NONE_OPTION = 'none-option';
export const CREATE_NEW_OPTION = 'add-new-option';
export const TOGGLE_FIELD_LABEL = 'toggle-field-label';

export const DELETE_OPTION = 'delete-option';
export const ADD_NEW_OPTION = 'add-new-option';

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
  editSearchString: '',
};

export const NO_SORTING_FIELD: FieldConfig = {
  isList: false,
  name: 'displayOptions.sorting.noSorting',
  type: 'String',
  editSearchString: '',
};

export const ifNoneNullElseValue = (value: string) =>
  value === NONE_OPTION ? null : value;
