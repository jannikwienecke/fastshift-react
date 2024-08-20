import React from 'react';
import { ViewContext } from './_internal/view-context';
import { ProviderContext } from '@apps-next/query-adapter';

export const useViewConfig = () => {
  const context = React.useContext(ViewContext);
  const co = React.useContext(ProviderContext);

  const _context = context.viewConfigManager ? context : co;

  if (!_context.viewConfigManager) {
    throw new Error('useViewConfig must be used within a ViewProvider');
  }
  return _context;
};
