'use client';

import React from 'react';
import { ApiClientType, GlobalConfig } from '@apps-next/core';

export type PrismaContextType = {
  prisma: ApiClientType;
} & GlobalConfig;

export const QueryContext = React.createContext<PrismaContextType>(
  {} as PrismaContextType
);
