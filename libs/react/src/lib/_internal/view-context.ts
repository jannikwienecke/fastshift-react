import { ViewContextType } from '@apps-next/core';
import React from 'react';

export const ViewContext = React.createContext<ViewContextType>(
  {} as ViewContextType
);
