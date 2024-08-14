import React from 'react';
import { ConvexContextType } from './types.convex';

export const ConvexContext = React.createContext<ConvexContextType>(
  {} as ConvexContextType
);
