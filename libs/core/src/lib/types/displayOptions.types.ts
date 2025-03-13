import { FieldConfig } from './base.types';

export type DisplayOptionsType = {
  sorting?: {
    field: FieldConfig;
    order: 'asc' | 'desc';
  };
  grouping?: {
    field: FieldConfig;
  };

  showDeleted?: boolean;
};
