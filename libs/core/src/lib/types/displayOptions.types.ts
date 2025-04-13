import { FieldConfig } from './base.types';
import { DisplayOptionsUiType } from './filter.types';

export type DisplayOptionsType = {
  sorting?: {
    field: FieldConfig;
    order: 'asc' | 'desc';
  };
  grouping?: {
    field: FieldConfig;
  };

  showDeleted?: boolean;
  selectedViewFields?: string[];
  showEmptyGroups?: boolean;
  viewType?: DisplayOptionsUiType['viewType']['type'];
};
