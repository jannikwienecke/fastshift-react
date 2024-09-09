import { getViews, ViewConfigType } from '@apps-next/core';
import {
  prefetchViewQuery,
  prismaViewLoader,
  prismaViewMutation,
} from '@apps-next/prisma-adapter';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { prisma } from '../../db';
import { globalConfig } from '../global-config';
import { ViewProvider } from './client-view-provider';
import { queryClient } from '../query-client';

export const ServerViewProvider = async ({
  viewConfig,
  children,
}: {
  viewConfig: ViewConfigType;
  children: React.ReactNode;
}) => {
  await prefetchViewQuery({
    queryClient: queryClient,
    viewConfig,
    viewLoader: (props) => prismaViewLoader(prisma, props),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ViewProvider
        views={getViews()}
        globalConfig={globalConfig.config}
        api={{
          viewLoader: async (dto) => {
            'use server';
            return prismaViewLoader(prisma, dto);
          },
          viewMutation: async (props) => {
            'use server';
            return prismaViewMutation(prisma, props);
          },
        }}
        viewConfig={viewConfig}
      >
        {children}
      </ViewProvider>
    </HydrationBoundary>
  );
};
