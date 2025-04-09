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

export const getUserViewQuery = () => {
  return convexQuery(api.query.userViewData, {});
};

export const getUserViewData = () => {
  const userViewData = queryClient.getQueryData(
    getUserViewQuery().queryKey
  ) as UserViewData;

  return userViewData;
};

export const getQueryKey = (viewConfig: ViewConfigType) => {
  const userViewData = getUserViewData();
  return preloadQuery(api.query.viewLoader, viewConfig, userViewData).queryKey;
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
