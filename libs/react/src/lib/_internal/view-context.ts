import { BaseViewConfigManagerInterface } from '@apps-next/core';
import React from 'react';

type ViewContextType = {
  viewConfigManager: BaseViewConfigManagerInterface;
};

export const ViewContext = React.createContext<ViewContextType>(
  {} as ViewContextType
);
