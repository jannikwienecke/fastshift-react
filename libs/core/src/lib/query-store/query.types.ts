import { Model, QueryReturnDto, RecordType } from '@apps-next/core';

export type QueryStore<T extends RecordType> = {
  dataModel: Model<T>;
  dataRaw: T[];

  loading: boolean;
  error: QueryReturnDto['error'];
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isInitialized: boolean;
};
