import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  QUERY_KEY_PREFIX,
} from '@apps-next/core';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import React from 'react';
import { PrismaClientType } from './prisma.client.types';
import { ServerSideConfigProvider } from './Provider';

export async function QueryPrefetchProvider({
  children,
  viewLoader,
  viewConfig,
}: React.PropsWithChildren<{
  viewLoader: PrismaClientType['viewLoader'];
  viewConfig: BaseViewConfigManagerInterface['viewConfig'];
}>) {
  const queryClient = new QueryClient();

  const viewConfigManager = new BaseViewConfigManager(viewConfig);
  const searchableFields = viewConfigManager.getSearchableField();
  const viewFields = viewConfigManager.viewConfig.viewFields;
  const viewName = viewConfigManager.getViewName();

  await queryClient.prefetchQuery({
    queryKey: [QUERY_KEY_PREFIX, viewName, ''],
    queryFn: async (context) =>
      await viewLoader({
        modelConfig: {
          viewFields: viewFields,
          searchableFields: searchableFields,
        },
        viewConfig: {
          ...viewConfigManager.viewConfig,
          viewFields: viewFields,
        },
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ServerSideConfigProvider viewConfig={viewConfigManager.viewConfig}>
        {children}
      </ServerSideConfigProvider>
    </HydrationBoundary>
  );
}
