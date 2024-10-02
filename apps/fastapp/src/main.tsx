import { createRouter, RouterProvider } from '@tanstack/react-router';
import * as ReactDOM from 'react-dom/client';

import { api, config } from '@apps-next/convex';
import {
  ConvexQueryProvider,
  getQueryKeyFn,
  preloadQuery,
} from '@apps-next/convex-adapter-app';
import { routeTree } from './routeTree.gen';

import { ConvexQueryClient } from '@convex-dev/react-query';
import { QueryClient } from '@tanstack/react-query';
import { ConvexReactClient } from 'convex/react';

const VITE_CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

const convex = new ConvexReactClient(VITE_CONVEX_URL);

const convexQueryClient = new ConvexQueryClient(convex);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});

convexQueryClient.connect(queryClient);

// syncObservable(store$, {
//   persist: {
//     name: 'store-global',
//     plugin: ObservablePersistLocalStorage,
//   },
// });

export const getQueryKey = getQueryKeyFn(api.query.viewLoader);

const router = createRouter({
  routeTree,
  defaultPreload: 'viewport',
  defaultStaleTime: 5000,
  context: {
    queryClient,
    preloadQuery: (viewConfig) =>
      queryClient.ensureQueryData(
        preloadQuery(api.query.viewLoader, viewConfig)
      ),
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('root not found');

export const loader = api.query.viewLoader;

ReactDOM.createRoot(root).render(
  // <React.StrictMode>
  <ConvexQueryProvider
    queryClient={queryClient}
    convex={convex}
    globalConfig={config}
    viewLoader={api.query.viewLoader}
    viewMutation={api.query.viewMutation}
  >
    <RouterProvider router={router} />
  </ConvexQueryProvider>
  // </React.StrictMode>
);
