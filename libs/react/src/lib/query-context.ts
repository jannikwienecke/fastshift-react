'use client';

import React from 'react';
import {
  ApiClientType,
  GlobalConfig,
  MutationReturnDto,
  QueryProps,
} from '@apps-next/core';
import { QueryOptions } from '@tanstack/react-query';

export type PrismaContextType = {
  prisma?: ApiClientType;
  makeQueryOptions?: (args: QueryProps) => QueryOptions;
  mutationFn?: (...args: any) => Promise<MutationReturnDto>;
} & GlobalConfig;

export const QueryContext = React.createContext<PrismaContextType>(
  {} as PrismaContextType
);
