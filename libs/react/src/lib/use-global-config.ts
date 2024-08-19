import { PrismaContext } from '@apps-next/query-adapter';
import { ConvexContext } from '@apps-next/convex-adapter-app';

import { useContext } from 'react';
import { GlobalConfig } from '@apps-next/core';

export const useGlobalConfig = () => {
  const prismaContext = useContext(PrismaContext);
  const convexContext = useContext(ConvexContext);

  if (prismaContext.provider === 'prisma') {
    return prismaContext as GlobalConfig;
  }

  if (convexContext.provider === 'convex') {
    return convexContext as GlobalConfig;
  }

  throw new Error('Provider not found');
};
