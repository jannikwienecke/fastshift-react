import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import * as ReactDOM from 'react-dom/client';

import { api, schema } from '@apps-next/convex';
import {
  ConvexQueryProvider,
  createConfigFromConvexSchema,
} from '@apps-next/convex-adapter-app';
import { routeTree } from './routeTree.gen';

import { llinfo } from '@apps-next/core';
import '@picocss/pico/css/pico.classless.min.css';
// import {api} from '@apps-next/convex'
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

const config = createConfigFromConvexSchema(schema);
llinfo('Global Config: ', config);

declare module '@apps-next/core' {
  interface Register {
    config: typeof config;
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
      api={{
        viewLoader: api.query.viewLoader,
        viewMutation: api.query.viewMutation,
      }}
    >
      <RouterProvider router={router} />

      <ReactQueryDevtools initialIsOpen={false} />
    </ConvexQueryProvider>
  </React.StrictMode>
);
