import React from 'react';
import { ViewContext } from './_internal/view-context';

export const useViewConfig = () => {
  const context = React.useContext(ViewContext);

  if (context === undefined) {
    throw new Error('useViewConfig must be used within a ViewProvider');
  }
  return context;
};
