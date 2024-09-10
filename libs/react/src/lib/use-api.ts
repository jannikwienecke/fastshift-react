import React from 'react';
import { QueryContext } from './query-context';

export const useApi = () => {
  const prismaContext = React.useContext(QueryContext);

  if (!prismaContext.provider) {
    throw new Error('ConvexContext not found');
  }

  return prismaContext;
};
