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

export type SearchFilterBuilder = {
  search: (fieldName: string, query: string) => unknown;
  eq: (fieldName: string | QFieldReturn, value: unknown) => unknown;
  or: (...args: unknown[]) => unknown;
  field: QField;
};
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
    // findMany: (args: ConvexFindManyArgs) => Promise<PrismaRecord[]>;
    // create: (args: { data: PrismaRecord }) => Promise<PrismaRecord>;
    // delete: (args: { where: { id: ID } }) => Promise<void>;
    // deleteMany: (args: { where: Record<string, unknown> }) => Promise<void>;
    // update: (args: { where: { id: ID }; data: PrismaRecord }) => Promise<void>;
    // findUnique: (args: {
    //   where: { id: ID };
    //   select: ConvexInclude;
    // }) => Promise<PrismaRecord>;
  };
};

export type DbMutation = ConvexClient[string];
