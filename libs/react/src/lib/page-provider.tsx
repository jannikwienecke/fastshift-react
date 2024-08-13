import { ViewConfig } from '@apps-next/core';
import React from 'react';
import { ViewContext } from './view-context';

export const ViewProvider = ({
  children,
  viewConfig,
}: {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewConfig: ViewConfig<any>;
}) => {
  return (
    <ViewContext.Provider value={{ viewConfig }}>
      {children}
    </ViewContext.Provider>
  );
};
