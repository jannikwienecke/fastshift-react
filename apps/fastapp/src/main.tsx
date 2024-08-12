import { ConvexQueryClient } from '@convex-dev/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import React from 'react';
import * as ReactDOM from 'react-dom/client';

import { routeTree } from './routeTree.gen';

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 5000,
});

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const VITE_CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

const convex = new ConvexReactClient(VITE_CONVEX_URL as string);

const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});

convexQueryClient.connect(queryClient);

const root = document.getElementById('root');
if (!root) throw new Error('root not found');
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ConvexProvider>
  </React.StrictMode>
);
