import { api } from '@apps-next/convex';
import { getQueryKeyFn } from '@apps-next/convex-adapter-app';

import { ConvexQueryClient } from '@convex-dev/react-query';
import { QueryClient } from '@tanstack/react-query';
import { ConvexReactClient } from 'convex/react';

const VITE_CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

export const convex = new ConvexReactClient(VITE_CONVEX_URL);

const convexQueryClient = new ConvexQueryClient(convex);

export const getQueryKey = getQueryKeyFn(api.query.viewLoader);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});

convexQueryClient.connect(queryClient);
