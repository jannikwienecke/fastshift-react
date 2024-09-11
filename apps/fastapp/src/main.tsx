import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import * as ReactDOM from 'react-dom/client';

import { api } from '@apps-next/convex';
import { ConvexQueryProvider } from '@apps-next/convex-adapter-app';
import { routeTree } from './routeTree.gen';

import { config } from './global-config';
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 5000,
});

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
      globalConfig={config}
      convexUrl={VITE_CONVEX_URL}
      viewLoader={api.query.viewLoader}
      viewMutation={api.query.viewMutation}
    >
      <RouterProvider router={router} />

      <ReactQueryDevtools initialIsOpen={false} />
    </ConvexQueryProvider>
  </React.StrictMode>
);
