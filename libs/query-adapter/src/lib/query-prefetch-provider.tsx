import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  QUERY_KEY_PREFIX,
  REGISTRED_VIEWS,
} from '@apps-next/core';
import {
  dehydrate,
  HydrationBoundary,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query';
import React from 'react';
import { PrismaClientType } from './prisma.client.types';
import { ServerSideConfigProvider } from './server-side-config-context';

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
  const registeredViews = REGISTRED_VIEWS;
  // const includeConfig = INCLUDE_CONFIG;

  await queryClient.prefetchQuery({
    queryKey: [QUERY_KEY_PREFIX, viewName, ''],

    queryFn: async (context) => {
      const res = await viewLoader({
        registeredViews,
        modelConfig: {
          viewFields: viewFields,
          searchableFields: searchableFields,
        },
        viewConfig: {
          ...viewConfigManager.viewConfig,
          viewFields: viewFields,
        },
      });

      return res;
    },
  });

  return (
    <ServerSideConfigProvider
      registeredViews={registeredViews}
      viewConfig={viewConfigManager.viewConfig}
      includeConfig={{}}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        {children}
      </HydrationBoundary>
    </ServerSideConfigProvider>
  );
}
