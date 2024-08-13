import React from 'react';
import { ConvexApiType, ConvexContextType } from './types.convex';

export const ConvexContext = React.createContext<ConvexContextType>(
  {} as ConvexContextType
);

export const ConvexContextProvider = (
  props: React.PropsWithChildren<{ api: ConvexApiType }>
) => {
  return (
    <ConvexContext.Provider value={{ api: props.api }}>
      {props.children}
    </ConvexContext.Provider>
  );
};

export const useConvexApi = () => {
  const convexContext = React.useContext(ConvexContext);
  if (!convexContext) {
    throw new Error('ConvexContext not found');
  }

  return convexContext.api;
};
