/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  GlobalConfig,
  MutationReturnDto,
  QueryReturnDto,
} from '@apps-next/core';
import {
  DefaultFunctionArgs,
  FunctionReference,
  Id,
} from './convex.server.types';
import { QueryClient } from '@tanstack/react-query';
import { ConvexReactClient } from 'convex/react';

export type ConvexServer = {
  query: (options: {
    args: any;
    handler: (ctx: any, ...args: any) => Promise<unknown>;
  }) => any;
};

export type RecordType = Record<string, unknown>;
export type ConvexRecordType = {
  _id: ID;
} & RecordType;

export type ViewLoader = FunctionReference<
  'query',
  'public',
  DefaultFunctionArgs,
  QueryReturnDto
>;

export type ViewMutation = FunctionReference<
  'mutation',
  'public',
  DefaultFunctionArgs,
  MutationReturnDto
>;

export type ConvexApiType = {
  viewLoader: ViewLoader;
  viewMutation: ViewMutation;
};

export type ConvexQueryProviderProps = React.PropsWithChildren<{
  viewLoader: ViewLoader;
  viewMutation: ViewMutation;
  globalConfig: Omit<GlobalConfig, 'provider'>;
  queryClient: QueryClient;
  convex: ConvexReactClient;
}>;

export type ConvexSchemaType = {
  tables: Record<string, any>;
};

export type ID = Id<any>;

export type ConvexRecord = Record<string, any> & { _id: ID };

export type ConvexWhere = {
  //
};

export type ConvexOrderBy = {
  //
};
export type ConvexInclude = {
  [key in string]: boolean | ConvexInclude;
};

export type ConvexFindManyArgs = {
  take?: number;
  where?: ConvexWhere;
  orderBy?: ConvexOrderBy;
  include?: ConvexInclude;
  select?: ConvexInclude;
};

type QFieldReturn = {
  //
};
type QField = (fieldName: string) => QFieldReturn;

export type OperatorFns = {
  eq: (fieldName: string | QFieldReturn, value: unknown) => unknown;
  neq: (fieldName: string | QFieldReturn, value: unknown) => unknown;
  or: (...args: unknown[]) => unknown;
  and: (...args: unknown[]) => unknown;
};

export type SearchFilterBuilder = {
  search: (fieldName: string, query: string) => unknown;
  field: QField;
} & OperatorFns;

export type ConvexClient = {
  [key in string]: {
    collect: () => Promise<ConvexRecord[]>;
    take: (take: number) => Promise<ConvexRecord[]>;
    first: () => Promise<ConvexRecord>;
    order: (direction: 'asc' | 'desc') => ConvexClient[string];
    withSearchIndex: (
      indexName: string,
      search: (q: SearchFilterBuilder) => any
    ) => ConvexClient[string];
    withIndex: (
      indexName: string,
      query: (q: SearchFilterBuilder) => any
    ) => ConvexClient[string];
    delete: (id: ID) => Promise<void>;
    filter: (query: (q: SearchFilterBuilder) => any) => ConvexClient[string];

    insert: (tableName: string, data: RecordType) => Promise<void>;
  };
};

export type DbMutation = ConvexClient[string];
