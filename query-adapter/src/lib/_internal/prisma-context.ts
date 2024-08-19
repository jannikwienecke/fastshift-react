'use client';

import React from 'react';
import { PrismaClientType } from '../prisma.client.types';
import { GlobalConfig } from '@apps-next/core';

export type PrismaContextType = {
  prisma: PrismaClientType;
} & GlobalConfig;

export const PrismaContext = React.createContext<PrismaContextType>(
  {} as PrismaContextType
);
