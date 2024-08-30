import {
  Model,
  QueryRelationalData,
  QueryReturnDto,
  RecordType,
} from '@apps-next/core';

export type QueryStore<T extends RecordType> = {
  dataModel: Model<T>;
  dataRaw: T[];

  relationalDataRaw: QueryRelationalData;
  relationalDataModel: {
    [key: string]: Model<RecordType>;
  };

  loading: boolean;
  error: QueryReturnDto['error'];
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isInitialized: boolean;
};
