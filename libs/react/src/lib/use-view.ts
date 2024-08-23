import { ServerSideConfigContext } from '@apps-next/query-adapter';
import { useSetAtom } from 'jotai';
import React from 'react';
import { ViewContext } from './_internal/view-context';
import { registeredViewsAtom, viewConfigManagerAtom } from '@apps-next/core';

export const useView = () => {
  const context = React.useContext(ViewContext);
  const queryPrefetchProvider = React.useContext(ServerSideConfigContext);

  const _context = context.viewConfigManager ? context : queryPrefetchProvider;

  const setViewConfigManager = useSetAtom(viewConfigManagerAtom);
  const setRegisteredViews = useSetAtom(registeredViewsAtom);

  if (!_context.viewConfigManager) {
    throw new Error('useView must be used within a ViewProvider');
  }

  React.useEffect(() => {
    setViewConfigManager(_context.viewConfigManager);
  }, [_context.viewConfigManager, setViewConfigManager]);

  React.useEffect(() => {
    setRegisteredViews(_context.registeredViews);
  }, [_context.registeredViews, setRegisteredViews]);

  return _context;
};
