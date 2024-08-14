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
  data: T[];
  isLoading: boolean;
  isError: boolean;
};

export type QueryReturnOrUndefined<T extends RecordType = RecordType> =
  QueryReturnType<T>;

export type MutationReturnType = {
  mutate: (mutation: MutationProps) => void;
  isPending: boolean;
};
