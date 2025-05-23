/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as KanbanImport } from './routes/kanban'
import { Route as FastAppImport } from './routes/fastApp'
import { Route as DisplayOptionsImport } from './routes/display-options'
import { Route as IndexImport } from './routes/index'
import { Route as FastAppViewImport } from './routes/fastApp.$view'
import { Route as FastAppViewIdImport } from './routes/fastApp.$view.$id'
import { Route as FastAppViewIdOverviewImport } from './routes/fastApp.$view.$id.overview'
import { Route as FastAppViewIdModelImport } from './routes/fastApp.$view.$id.$model'

// Create/Update Routes

const KanbanRoute = KanbanImport.update({
  path: '/kanban',
  getParentRoute: () => rootRoute,
} as any)

const FastAppRoute = FastAppImport.update({
  path: '/fastApp',
  getParentRoute: () => rootRoute,
} as any)

const DisplayOptionsRoute = DisplayOptionsImport.update({
  path: '/display-options',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const FastAppViewRoute = FastAppViewImport.update({
  path: '/$view',
  getParentRoute: () => FastAppRoute,
} as any)

const FastAppViewIdRoute = FastAppViewIdImport.update({
  path: '/$id',
  getParentRoute: () => FastAppViewRoute,
} as any)

const FastAppViewIdOverviewRoute = FastAppViewIdOverviewImport.update({
  path: '/overview',
  getParentRoute: () => FastAppViewIdRoute,
} as any)

const FastAppViewIdModelRoute = FastAppViewIdModelImport.update({
  path: '/$model',
  getParentRoute: () => FastAppViewIdRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/display-options': {
      id: '/display-options'
      path: '/display-options'
      fullPath: '/display-options'
      preLoaderRoute: typeof DisplayOptionsImport
      parentRoute: typeof rootRoute
    }
    '/fastApp': {
      id: '/fastApp'
      path: '/fastApp'
      fullPath: '/fastApp'
      preLoaderRoute: typeof FastAppImport
      parentRoute: typeof rootRoute
    }
    '/kanban': {
      id: '/kanban'
      path: '/kanban'
      fullPath: '/kanban'
      preLoaderRoute: typeof KanbanImport
      parentRoute: typeof rootRoute
    }
    '/fastApp/$view': {
      id: '/fastApp/$view'
      path: '/$view'
      fullPath: '/fastApp/$view'
      preLoaderRoute: typeof FastAppViewImport
      parentRoute: typeof FastAppImport
    }
    '/fastApp/$view/$id': {
      id: '/fastApp/$view/$id'
      path: '/$id'
      fullPath: '/fastApp/$view/$id'
      preLoaderRoute: typeof FastAppViewIdImport
      parentRoute: typeof FastAppViewImport
    }
    '/fastApp/$view/$id/$model': {
      id: '/fastApp/$view/$id/$model'
      path: '/$model'
      fullPath: '/fastApp/$view/$id/$model'
      preLoaderRoute: typeof FastAppViewIdModelImport
      parentRoute: typeof FastAppViewIdImport
    }
    '/fastApp/$view/$id/overview': {
      id: '/fastApp/$view/$id/overview'
      path: '/overview'
      fullPath: '/fastApp/$view/$id/overview'
      preLoaderRoute: typeof FastAppViewIdOverviewImport
      parentRoute: typeof FastAppViewIdImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexRoute,
  DisplayOptionsRoute,
  FastAppRoute: FastAppRoute.addChildren({
    FastAppViewRoute: FastAppViewRoute.addChildren({
      FastAppViewIdRoute: FastAppViewIdRoute.addChildren({
        FastAppViewIdModelRoute,
        FastAppViewIdOverviewRoute,
      }),
    }),
  }),
  KanbanRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/display-options",
        "/fastApp",
        "/kanban"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/display-options": {
      "filePath": "display-options.tsx"
    },
    "/fastApp": {
      "filePath": "fastApp.tsx",
      "children": [
        "/fastApp/$view"
      ]
    },
    "/kanban": {
      "filePath": "kanban.tsx"
    },
    "/fastApp/$view": {
      "filePath": "fastApp.$view.tsx",
      "parent": "/fastApp",
      "children": [
        "/fastApp/$view/$id"
      ]
    },
    "/fastApp/$view/$id": {
      "filePath": "fastApp.$view.$id.tsx",
      "parent": "/fastApp/$view",
      "children": [
        "/fastApp/$view/$id/$model",
        "/fastApp/$view/$id/overview"
      ]
    },
    "/fastApp/$view/$id/$model": {
      "filePath": "fastApp.$view.$id.$model.tsx",
      "parent": "/fastApp/$view/$id"
    },
    "/fastApp/$view/$id/overview": {
      "filePath": "fastApp.$view.$id.overview.tsx",
      "parent": "/fastApp/$view/$id"
    }
  }
}
ROUTE_MANIFEST_END */
