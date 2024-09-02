import { DataModelNew, QueryReturnDto, RecordType } from '@apps-next/core';

export type QueryStore<T extends RecordType> = {
  dataModel: DataModelNew<T>;

  relationalDataModel: {
    [key: string]: DataModelNew<T>;
  };

  loading: boolean;
  error: QueryReturnDto['error'];
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isInitialized: boolean;
};
