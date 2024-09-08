import { ViewConfigType } from '@apps-next/core';
import { prefetchViewQuery, prismaViewLoader } from '@apps-next/prisma-adapter';
import { prisma } from '../../db';

export const prefetchView = async (viewConfig: ViewConfigType) => {
  return await prefetchViewQuery({
    viewConfig,
    viewLoader: (props) => prismaViewLoader(prisma, props),
  });
};
