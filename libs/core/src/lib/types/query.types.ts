import {
  BaseViewConfigManagerInterface,
  ModelConfig,
} from '../base-view-config';
import { RecordType } from './base.types';
import { DisplayOptionsType } from './displayOptions.types';
import { FilterType } from './filter.types';
import { HistoryType } from './history.types';
import { MutationDto, MutationReturnDto } from './mutation.types';
import { Emoji } from './ui.types';
import { RegisteredViews, ViewConfigType } from './view-config.types';

export type QueryProps = {
  query?: string;
  viewId: string | null;
  filters?: string;
  displayOptions?: string;
  paginateOptions?: {
    cursor: ContinueCursor;
    numItems: number;
    // isDone: boolean;
  };
  viewConfigManager?: BaseViewConfigManagerInterface;
  registeredViews: RegisteredViews;
  modelConfig?: ModelConfig;
  parentId?: string | null;
  parentViewName?: string | null;
  viewName?: string;
  relationQuery?: {
    tableName: string;
    recordId?: string;
  };
  disabled?: boolean;
};

export type QueryDto = {
  viewConfig?: ViewConfigType;
  viewConfigManager?: BaseViewConfigManagerInterface;
  viewId: string | null;
  parentViewName?: string | null;
  parentId?: string | null;
  filters?: string;
  displayOptions?: string;
  onlyRelationalData?: boolean;
} & Omit<QueryProps, 'viewConfigManager'>;

export type QueryServerProps = {
  viewId?: string | null | undefined;
  parentId?: string | null | undefined;
  parentViewName?: string | null | undefined;
  filters?: FilterType[];
  displayOptions?: DisplayOptionsType;
  viewConfigManager: BaseViewConfigManagerInterface;
} & Omit<QueryProps, 'filters' | 'displayOptions'>;

export type QueryRelationalData = {
  [key: string]: RecordType[];
};

export type ContinueCursor = {
  position: number | null;
  cursor: string | null;
};

export type UserViewData = {
  id: string;
  baseView: string;
  displayOptions: string;
  filters: string;
  name: string;
  slug: string;
  description: string | null;
  parentModel?: string;
  rowId?: string;
  rowLabelFieldName?: string;
  starred?: boolean;
  _deleted?: boolean;
  emoji?: Emoji;
};

export type UserViewDataDto = {
  id?: string;
  baseView: string;
  displayOptions: string;
  filters: string;
  name: string;
  slug: string;
  description: string | null;
  parentModel?: string;
  starred?: boolean;
};

export type QueryReturnDto<T extends RecordType = RecordType> = {
  data: T[] | undefined;
  relationalData?: QueryRelationalData;
  historyData?: HistoryType[] | undefined;
  error?: unknown;
  continueCursor: ContinueCursor;
  isDone: boolean;
  allIds: string[];
  view?: UserViewData;
};

export type QueryError = {
  message: string;
};

export type QueryReturnType<T extends RecordType = RecordType> = {
  data: T[] | undefined;
  relationalData?: QueryRelationalData;
  continueCursor: ContinueCursor;
  isDone: boolean;
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  error: QueryError | undefined | null;
  allIds: string[];
  view?: UserViewData;
  historyData?: HistoryType[] | undefined;
  // isFetching: boolean;
  // isFetched: boolean;
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
