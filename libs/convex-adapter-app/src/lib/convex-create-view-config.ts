import { GetTableName, SearchableField, ViewConfigType } from '@apps-next/core';

export type ConvexViewConfig<
  TDataModel extends Record<string, any> = any,
  T extends GetTableName = any
> = {
  query?: {
    searchableFields?: SearchableField<TDataModel>;
  };
} & ViewConfigType<T>;
