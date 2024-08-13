import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import * as ReactDOM from 'react-dom/client';

import { api } from '@apps-next/convex';
import { routeTree } from './routeTree.gen';
import { ConvexQueryProvider } from '@apps-next/convex-adapter';
import { config } from './config';

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

// const convex = new ConvexReactClient(VITE_CONVEX_URL as string);

// const convexQueryClient = new ConvexQueryClient(convex);
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       queryKeyHashFn: convexQueryClient.hashFn(),
//       queryFn: convexQueryClient.queryFn(),
//     },
//   },
// });

// convexQueryClient.connect(queryClient);

const root = document.getElementById('root');
if (!root) throw new Error('root not found');

export const loader = api.query.viewLoader;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ConvexQueryProvider
      // config={config}
      convexUrl={VITE_CONVEX_URL}
      api={{
        viewLoader: api.query.viewLoader,
      }}
    >
      <RouterProvider router={router} />

      <ReactQueryDevtools initialIsOpen={false} />
    </ConvexQueryProvider>
  </React.StrictMode>
);
