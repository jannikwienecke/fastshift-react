import { getViews, ViewConfigType } from '@apps-next/core';
import {
  prefetchViewQuery,
  prismaViewLoader,
  prismaViewMutation,
} from '@apps-next/prisma-adapter';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { prisma } from '../../db';
import { globalConfig } from '../global-config';
import { ClientViewProvider } from './client-view-provider';

export const ServerViewProvider = async ({
  viewConfig,
  children,
}: {
  viewConfig: ViewConfigType;
  children: React.ReactNode;
}) => {
  const queryClient = await prefetchViewQuery({
    viewConfig,
    viewLoader: (props) => prismaViewLoader(prisma, props),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientViewProvider
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
      </ClientViewProvider>
    </HydrationBoundary>
  );
};
