import React from 'react';
import { ViewContext } from './_internal/view-context';
import { ServerSideConfigContext } from '@apps-next/query-adapter';

export const useView = () => {
  const context = React.useContext(ViewContext);
  const queryPrefetchProvider = React.useContext(ServerSideConfigContext);

  const _context = context.viewConfigManager ? context : queryPrefetchProvider;

  if (!_context.viewConfigManager) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return _context;
};
