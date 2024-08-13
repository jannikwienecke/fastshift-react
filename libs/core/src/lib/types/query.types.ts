import { RecordType, ViewConfig } from './base.types';

export type QueryProps = {
  query?: string;
  viewConfig?: ViewConfig;
};

export type QueryReturnType<T extends RecordType = RecordType> = {
  data: T[];
  isLoading: boolean;
  isError: boolean;
};

export type QueryReturnOrUndefined<T extends RecordType = RecordType> =
  QueryReturnType<T>;
