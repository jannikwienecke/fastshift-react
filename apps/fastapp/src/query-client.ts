import { api } from '@apps-next/convex';
import { preloadQuery } from '@apps-next/convex-adapter-app';
import { _log, UserViewData, ViewConfigType } from '@apps-next/core';

import { convexQuery, ConvexQueryClient } from '@convex-dev/react-query';
import { QueryClient } from '@tanstack/react-query';
import { ConvexReactClient } from 'convex/react';

const VITE_CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

_log.warn('Convex URL:', VITE_CONVEX_URL);

export const convex = new ConvexReactClient(VITE_CONVEX_URL);

const convexQueryClient = new ConvexQueryClient(convex);

export const getUserViewQuery = (viewName: string) => {
  return convexQuery(api.query.userViewData, {
    viewName: viewName ?? null,
  });
};

export const getUserViewData = (viewName: string) => {
  const userViewData = queryClient.getQueryData(
    getUserViewQuery(viewName).queryKey
  ) as UserViewData | undefined;

  return userViewData;
};

export const getQueryKey = (
  viewConfig: ViewConfigType,
  viewName: string,
  viewId: string | null
) => {
  const userViewData = getUserViewData(viewName);
  return preloadQuery(
    api.query.viewLoader,
    viewConfig,
    userViewData ?? null,
    viewId
  ).queryKey;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});

convexQueryClient.connect(queryClient);
