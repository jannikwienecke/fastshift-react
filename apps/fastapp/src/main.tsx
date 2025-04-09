import { createRouter, RouterProvider } from '@tanstack/react-router';
import * as ReactDOM from 'react-dom/client';

import { api, config } from '@apps-next/convex';
import {
  ConvexQueryProvider,
  preloadQuery,
} from '@apps-next/convex-adapter-app';

import { logger, UserViewData } from '@apps-next/core';
import './i18n';
import { convex, queryClient } from './query-client';
import { routeTree } from './routeTree.gen';
import { convexQuery } from '@convex-dev/react-query';

// syncObservable(store$, {
//   persist: {
//     name: 'store-global',
//     plugin: ObservablePersistLocalStorage,
//   },
// });

const isDev = import.meta.env.MODE === 'development';

logger.setLevel(isDev ? 'info' : 'warn');

const router = createRouter({
  routeTree,
  defaultPreload: 'viewport',
  defaultStaleTime: 5000,
  // Wrap:
  context: {
    queryClient,
    preloadQuery: async (viewConfig) => {
      await queryClient.ensureQueryData(
        convexQuery(api.query.userViewData, {})
      );

      const userViewData = queryClient.getQueryData(
        convexQuery(api.query.userViewData, {}).queryKey
      ) as UserViewData;

      const xx = await queryClient.ensureQueryData(
        preloadQuery(api.query.viewLoader, viewConfig, userViewData)
      );

      return xx;
    },
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
