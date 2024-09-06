import React from 'react';
import { QueryContext } from './query-context';

export const usePrismaApi = () => {
  const prismaContext = React.useContext(QueryContext);

  if (!prismaContext.provider) {
    throw new Error('ConvexContext not found');
  }

  return prismaContext.prisma;
};
