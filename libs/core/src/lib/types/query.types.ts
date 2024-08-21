import {
  BaseViewConfigManagerInterface,
  ModelConfig,
} from '../base-view-config';
import { RecordType } from './base.types';
import { MutationProps, MutationReturnDto } from './mutation.types';
import { RegisteredViews, ViewConfigType } from './view-config.types';

export type QueryProps = {
  query?: string;
  viewConfigManager?: BaseViewConfigManagerInterface;
  registeredViews: RegisteredViews;
  modelConfig?: ModelConfig;
};

export type QueryDto = {
  viewConfig?: ViewConfigType;
} & Omit<QueryProps, 'viewConfigManager'>;

export type QueryReturnDto<T extends RecordType = RecordType> = {
  data: T[] | undefined;
  error?: any;
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
  mutateAsync: (mutation: MutationProps) => Promise<MutationReturnDto>;
};

export const QUERY_KEY_PREFIX = 'view-loader';
