import React from 'react';
import { ViewContext } from './view-context';
import { BaseViewConfigManagerInterface } from '@apps-next/core';

export const ViewProvider = ({
  children,
  viewConfig,
}: {
  children: React.ReactNode;
  viewConfig: BaseViewConfigManagerInterface;
}) => {
  return (
    <ViewContext.Provider value={{ viewConfig }}>
      {children}
    </ViewContext.Provider>
  );
};
