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

export type ConvexServer = {
  query: (options: {
    args: any;
    handler: (ctx: any, ...args: any) => Promise<unknown>;
  }) => any;
};

export type RecordType = Record<string, unknown>;
export type ConvexRecordType = {
  _id: string;
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
  convexUrl: string;
  // api: ConvexApiType;
  // makeQueryOptions: (args: QueryProps) => QueryOptions;
  viewLoader: ViewLoader;
  globalConfig: Omit<GlobalConfig, 'provider'>;
}>;

export type ConvexContextType = GlobalConfig;

export type ConvexSchemaType = {
  tables: Record<string, any>;
};

export type ID = Id<any>;

export type ConvexRecord = Record<string, any> & { _id?: ID };

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

export type SearchFilterBuilder = {
  search: (fieldName: string, query: string) => unknown;
  eq: (fieldName: string, value: unknown) => unknown;
};
export type ConvexClient = {
  [key in string]: {
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
