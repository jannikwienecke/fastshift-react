import {
  ApiClientType,
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  makeQueryKey,
  registeredViewsServerAtom,
  registeredViewsServerStore,
} from '@apps-next/core';

import { QueryClient } from '@tanstack/react-query';

export async function prefetchViewQuery({
  viewLoader,
  viewConfig,
  queryClient,
}: {
  viewLoader: ApiClientType['viewLoader'];
  viewConfig: BaseViewConfigManagerInterface['viewConfig'];
  queryClient: QueryClient;
}) {
  const viewConfigManager = new BaseViewConfigManager(viewConfig);
  const searchableFields = viewConfigManager.getSearchableField();
  const viewFields = viewConfigManager.viewConfig.viewFields;
  const viewName = viewConfigManager.getViewName();

  const registeredViewsServer = registeredViewsServerStore.get(
    registeredViewsServerAtom
  );

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
