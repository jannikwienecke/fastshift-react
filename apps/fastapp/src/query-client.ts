import { api } from '@apps-next/convex';
import { preloadQuery } from '@apps-next/convex-adapter-app';
import { _log, UserViewData, ViewConfigType } from '@apps-next/core';

import { convexQuery, ConvexQueryClient } from '@convex-dev/react-query';
import { QueryClient } from '@tanstack/react-query';
import { ConvexReactClient } from 'convex/react';

const VITE_CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

console.log('===VITE_CONVEX_URL===', VITE_CONVEX_URL);

_log.warn('Convex URL:', VITE_CONVEX_URL);

export const convex = new ConvexReactClient(VITE_CONVEX_URL);

const convexQueryClient = new ConvexQueryClient(convex);

export const getUserViewsQuery = () => {
  return convexQuery(api.query.getUserViews, {});
};

export const getUserViews = () => {
  const userViews = queryClient.getQueryData(
    getUserViewsQuery().queryKey
  ) as UserViewData[];

  return userViews;
};

export const getQueryKey = (
  viewConfig: ViewConfigType,
  viewName: string,
  viewId: string | null,
  parentViewName: string | null,
  parentId: string | null
) => {
  // FIXME -> same logic in main.ts
  let userViewData: UserViewData | null | undefined = null;
  if (parentViewName) {
    userViewData = null;
  } else {
    // TODO REFACTOR AND USE SAME AS IN MAIN
    const userViews = getUserViews();
    userViewData = userViews.find((u) => u.name === viewName);
  }

  return preloadQuery(
    api.query.viewLoader,
    viewConfig,
    userViewData ?? null,
    viewId,
    parentViewName,
    parentId
  ).queryKey;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      gcTime: 1000 * 10,
      staleTime: Infinity,

      queryFn: convexQueryClient.queryFn(),
    },
  },
});

convexQueryClient.connect(queryClient);
