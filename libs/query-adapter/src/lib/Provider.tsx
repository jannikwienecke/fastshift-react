'use client';

import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
} from '@apps-next/core';
import React from 'react';

type ProviderProps = {
  viewConfigManager: BaseViewConfigManagerInterface;
};

export const ProviderContext = React.createContext<ProviderProps>(
  {} as ProviderProps
);

// used in apps like nextjs when prefetching data and creating
// the view config in the server.
// Used together with QueryPrefetchProvider
export const ServerSideConfigProvider = (
  props: {
    viewConfig: BaseViewConfigManagerInterface['viewConfig'];
  } & { children: React.ReactNode }
) => {
  const viewConfigManager = new BaseViewConfigManager(props.viewConfig);
  return (
    <ProviderContext.Provider value={{ viewConfigManager }}>
      {props.children}
    </ProviderContext.Provider>
  );
};
