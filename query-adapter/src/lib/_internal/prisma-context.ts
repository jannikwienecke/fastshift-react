'use client';

import React from 'react';
import { PrismaClientType } from '../prisma.client.types';

export type PrismaContextType = {
  prisma: PrismaClientType;
};

export const PrismaContext = React.createContext<PrismaContextType>(
  {} as PrismaContextType
);
