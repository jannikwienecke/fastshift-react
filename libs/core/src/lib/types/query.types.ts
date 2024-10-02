import {
  BaseViewConfigManagerInterface,
  ModelConfig,
} from '../base-view-config';
import { RecordType } from './base.types';
import { FilterType } from './filter.types';
import { MutationDto, MutationReturnDto } from './mutation.types';
import { RegisteredViews, ViewConfigType } from './view-config.types';

export type QueryProps = {
  query?: string;
  filters?: string;
  viewConfigManager?: BaseViewConfigManagerInterface;
  registeredViews: RegisteredViews;
  modelConfig?: ModelConfig;
  viewName?: string;
  relationQuery?: {
    tableName: string;
    recordId?: string;
  };
  disabled?: boolean;
};

export type QueryDto = {
  viewConfig?: ViewConfigType;
  filters?: string;
} & Omit<QueryProps, 'viewConfigManager'>;

export type QueryServerProps = {
  filters?: FilterType[];
  viewConfigManager: BaseViewConfigManagerInterface;
} & Omit<QueryProps, 'filters'>;

export type QueryRelationalData = {
  [key: string]: RecordType[];
};

export type QueryReturnDto<T extends RecordType = RecordType> = {
  data: T[] | undefined;
  relationalData?: QueryRelationalData;
  error?: unknown;
};

export type QueryError = {
  message: string;
};

export type QueryReturnType<T extends RecordType = RecordType> = {
  data: T[] | undefined;
  relationalData?: QueryRelationalData;
  isLoading: boolean;
  isError: boolean;
  error: QueryError | undefined;
  isFetching: boolean;
  isFetched: boolean;
  refetch: () => void;
};

export type QueryReturnOrUndefined<T extends RecordType = RecordType> =
  QueryReturnType<T> & {
    prefetchRelatioanlQuery?: (queryProps: QueryProps['relationQuery']) => void;
  };

export type MutationReturnType = {
  isPending: boolean;
  mutate: (mutation: MutationDto) => void;
  mutateAsync: (mutation: MutationDto) => Promise<MutationReturnDto>;
};

export const QUERY_KEY_PREFIX = 'view-loader';
export const RELATIONAL_QUERY_KEY_PREFIX = 'relational-view-loader';

export type ApiClientType = {
  viewLoader: (dto: QueryDto) => Promise<QueryReturnDto>;
  viewMutation: (props: MutationDto) => Promise<MutationReturnDto>;
};
