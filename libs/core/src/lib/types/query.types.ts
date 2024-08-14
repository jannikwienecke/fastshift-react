import { RecordType } from './base.types';
import { BaseViewConfigManagerInterface } from './view-config.types';

export type QueryProps = {
  query?: string;
  viewConfig?: BaseViewConfigManagerInterface;
};

export type QueryReturnType<T extends RecordType = RecordType> = {
  data: T[];
  isLoading: boolean;
  isError: boolean;
};

export type QueryReturnOrUndefined<T extends RecordType = RecordType> =
  QueryReturnType<T>;
