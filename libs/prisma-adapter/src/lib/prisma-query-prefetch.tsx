import {
  ApiClientType,
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  makeQueryKey,
  registeredViewsServerAtom,
  registeredViewsServerStore,
} from '@apps-next/core';

import { QueryClient } from '@tanstack/react-query';
import React from 'react';

export async function prefetchViewQuery({
  children,
  viewLoader,
  viewConfig,
}: React.PropsWithChildren<{
  viewLoader: ApiClientType['viewLoader'];
  viewConfig: BaseViewConfigManagerInterface['viewConfig'];
}>) {
  const viewConfigManager = new BaseViewConfigManager(viewConfig);
  const searchableFields = viewConfigManager.getSearchableField();
  const viewFields = viewConfigManager.viewConfig.viewFields;
  const viewName = viewConfigManager.getViewName();

  const registeredViewsServer = registeredViewsServerStore.get(
    registeredViewsServerAtom
  );

  const queryClient = new QueryClient();

  const queryKey = makeQueryKey({
    viewName,
  });

  const queryData = queryClient.getQueryData(queryKey);

  if (!queryData) {
    await queryClient.prefetchQuery({
      queryKey,

      queryFn: async (context: any) => {
        const res = await viewLoader({
          registeredViews: registeredViewsServer,
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
  }

  return queryClient;
}
