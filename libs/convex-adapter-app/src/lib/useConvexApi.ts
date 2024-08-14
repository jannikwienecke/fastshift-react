import React from 'react';
import { ConvexContext } from './convex-context';

export const useConvexApi = () => {
  const convexContext = React.useContext(ConvexContext);
  if (!convexContext) {
    throw new Error('ConvexContext not found');
  }

  return convexContext.api;
};
