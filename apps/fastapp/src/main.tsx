import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import * as ReactDOM from 'react-dom/client';

import { api } from '@apps-next/convex';
import { routeTree } from './routeTree.gen';
import { ConvexQueryProvider } from '@apps-next/convex-adapter';

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

const root = document.getElementById('root');
if (!root) throw new Error('root not found');

export const loader = api.query.viewLoader;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ConvexQueryProvider
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
