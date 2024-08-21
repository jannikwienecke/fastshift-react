import React from 'react';
import { ViewContext } from './_internal/view-context';
import { ServerSideConfigContext } from '@apps-next/query-adapter';
import { atom, useSetAtom } from 'jotai';
import { BaseViewConfigManagerInterface } from '@apps-next/core';

export const viewConfigManagerAtom =
  atom<BaseViewConfigManagerInterface | null>(null);

export const useView = () => {
  const context = React.useContext(ViewContext);
  const queryPrefetchProvider = React.useContext(ServerSideConfigContext);

  const _context = context.viewConfigManager ? context : queryPrefetchProvider;

  const setViewConfigManager = useSetAtom(viewConfigManagerAtom);

  if (!_context.viewConfigManager) {
    throw new Error('useView must be used within a ViewProvider');
  }

  React.useEffect(() => {
    setViewConfigManager(_context.viewConfigManager);
  }, [_context.viewConfigManager, setViewConfigManager]);

  return _context;
};
