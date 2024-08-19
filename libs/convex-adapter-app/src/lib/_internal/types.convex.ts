/* eslint-disable @typescript-eslint/no-explicit-any */

import { GlobalConfig } from '@apps-next/core';
import { DefaultFunctionArgs, FunctionReference } from './convex.server.types';

export type ConvexServer = {
  query: (options: {
    args: any;
    handler: (ctx: any, ...args: any) => Promise<unknown>;
  }) => any;
};

export type ConvexRecordType = {
  _id: string;
} & Record<string, unknown>;

export type ViewLoader = FunctionReference<
  'query',
  'public',
  DefaultFunctionArgs,
  ConvexRecordType[] | null
>;

export type ViewMutation = FunctionReference<
  'mutation',
  'public',
  DefaultFunctionArgs,
  null
>;

export type ConvexApiType = {
  viewLoader: ViewLoader;
  viewMutation: ViewMutation;
};

export type ConvexQueryProviderProps = React.PropsWithChildren<{
  convexUrl: string;
  api: ConvexApiType;
  globalConfig: Omit<GlobalConfig, 'provider'>;
}>;

export type ConvexContextType = {
  api: ConvexApiType;
} & GlobalConfig;

export type ConvexSchemaType = {
  tables: Record<string, any>;
};
