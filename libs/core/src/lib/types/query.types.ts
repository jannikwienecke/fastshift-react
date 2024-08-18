import { RecordType } from './base.types';
import { MutationProps } from './mutation.types';
import {
  BaseViewConfigManagerInterface,
  ViewConfigType,
} from './view-config.types';

export type QueryDto = {
  query?: string;
  viewConfig?: ViewConfigType;
};

export type QueryProps = {
  query?: string;
  viewConfigManager?: BaseViewConfigManagerInterface;
};

export type QueryReturnType<T extends RecordType = RecordType> = {
  data: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  // TODO CLEAN UP
  error: any;
  isFetching: boolean;
  isFetched: boolean;
  refetch: () => void;
};

export type QueryReturnOrUndefined<T extends RecordType = RecordType> =
  QueryReturnType<T>;

export type MutationReturnType = {
  mutate: (mutation: MutationProps) => void;
  isPending: boolean;
};
