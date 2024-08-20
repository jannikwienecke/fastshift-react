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
  const viewFields = viewConfigManager.getViewFieldList();
  const viewName = viewConfigManager.getViewName();

  await queryClient.prefetchQuery({
    queryKey: [QUERY_KEY_PREFIX, viewName, ''],
    queryFn: (context) =>
      viewLoader({
        viewConfig: {
          viewName,
          viewFields: viewFields,
          tableName: viewName,
          displayField: {
            field: viewFields[0].name,
          },
          query: {
            searchableFields,
          },
        },
      }),
  });

  return (
    <ServerSideConfigProvider viewConfig={viewConfigManager.viewConfig}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        {children}
      </HydrationBoundary>
    </ServerSideConfigProvider>
  );
}
