import { createRouter, RouterProvider } from '@tanstack/react-router';
import * as ReactDOM from 'react-dom/client';

import { api, config } from '@apps-next/convex';
import {
  ConvexQueryProvider,
  preloadQuery,
} from '@apps-next/convex-adapter-app';

import { logger, UserViewData } from '@apps-next/core';
import './i18n';
import { convex, getUserViews, queryClient } from './query-client';
import { routeTree } from './routeTree.gen';

import './views';
import './shared/hooks/app.persist';

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

  context: {
    queryClient,
    preloadQuery: async (
      viewConfig,
      viewName,
      viewId,
      parentViewName,
      parentId
    ) => {
      let userViewData: UserViewData | null | undefined = null;
      if (parentViewName) {
        userViewData = null;
      } else {
        const userViews = getUserViews();
        userViewData = userViews.find((u) => u.name === viewName);
      }

      return await queryClient.ensureQueryData(
        preloadQuery(
          api.query.viewLoader,
          viewConfig,
          userViewData ?? null,
          !viewId ? null : viewId === '#' ? null : viewId,
          parentViewName ?? null,
          parentId ?? null
        )
      );
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
