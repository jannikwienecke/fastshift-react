import React from 'react';
import { ViewContext } from './view-context';

export const useViewConfig = () => {
  const context = React.useContext(ViewContext);
  console.log({ context });

  if (context === undefined) {
    throw new Error('useViewConfig must be used within a ViewProvider');
  }
  return context;
};
