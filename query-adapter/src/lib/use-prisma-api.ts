import React from 'react';
import { PrismaContext } from './_internal/prisma-context';

export const usePrismaApi = () => {
  const prismaContext = React.useContext(PrismaContext);

  if (!prismaContext.provider) {
    throw new Error('ConvexContext not found');
  }

  return prismaContext.prisma;
};
