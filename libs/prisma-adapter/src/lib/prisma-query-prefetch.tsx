import {
  ApiClientType,
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  makeQueryKey,
  RegisteredViews,
} from '@apps-next/core';

import { QueryClient } from '@tanstack/react-query';

export async function prefetchViewQuery({
  viewLoader,
  viewConfig,
  queryClient,
  views,
}: {
  viewLoader: ApiClientType['viewLoader'];
  viewConfig: BaseViewConfigManagerInterface['viewConfig'];
  queryClient: QueryClient;
  views: RegisteredViews;
}) {
  const viewConfigManager = new BaseViewConfigManager(viewConfig);
  const searchableFields = viewConfigManager.getSearchableField();
  const viewFields = viewConfigManager.viewConfig.viewFields;
  const viewName = viewConfigManager.getViewName();

  const queryKey = makeQueryKey({
    viewName,
  });

  const queryData = queryClient.getQueryData(queryKey);

  if (!queryData) {
    await queryClient.prefetchQuery({
      queryKey,

      queryFn: async (context: any) => {
        const res = await viewLoader({
          registeredViews: views,
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
