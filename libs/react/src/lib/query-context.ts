'use client';

import React from 'react';
import {
  ApiClientType,
  GlobalConfig,
  MutationReturnDto,
  QueryProps,
  RelationalFilterQueryProps,
} from '@apps-next/core';
import { QueryOptions } from '@tanstack/react-query';

export type MakeQueryOptions = (args: QueryProps) => QueryOptions;
export type MakeRelationalFilterOptions = (
  args: RelationalFilterQueryProps
) => QueryOptions;

export type PrismaContextType = {
  prisma?: ApiClientType;
  makeQueryOptions: MakeQueryOptions;
  makeRelationalFilterOptions: MakeRelationalFilterOptions;
  mutationFn?: (...args: any) => Promise<MutationReturnDto>;
} & GlobalConfig;

export const QueryContext = React.createContext<PrismaContextType>(
  {} as PrismaContextType
);
