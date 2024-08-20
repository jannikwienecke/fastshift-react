'use client';

import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  RegisteredViews,
  ViewContextType,
} from '@apps-next/core';
import React from 'react';

export const ServerSideConfigContext = React.createContext<ViewContextType>(
  {} as ViewContextType
);

// used in apps like nextjs when prefetching data and creating
// the view config in the server.
// Used together with QueryPrefetchProvider
export const ServerSideConfigProvider = (
  props: {
    viewConfig: BaseViewConfigManagerInterface['viewConfig'];
    registeredViews: RegisteredViews;
  } & { children: React.ReactNode }
) => {
  const viewConfigManager = new BaseViewConfigManager(props.viewConfig);
  return (
    <ServerSideConfigContext.Provider
      value={{ viewConfigManager, registeredViews: props.registeredViews }}
    >
      {props.children}
    </ServerSideConfigContext.Provider>
  );
};
