import { ServerSideConfigContext } from '@apps-next/query-adapter';
import { useSetAtom } from 'jotai';
import React from 'react';
import { ViewContext } from './_internal/view-context';
import {
  registeredViewsAtom,
  setGlobalConfigAtom,
  viewConfigManagerAtom,
} from '@apps-next/core';
import { useGlobalConfig } from './use-global-config';

export const useView = () => {
  const context = React.useContext(ViewContext);
  const queryPrefetchProvider = React.useContext(ServerSideConfigContext);

  const globalConfig = useGlobalConfig();

  const _context = context.viewConfigManager ? context : queryPrefetchProvider;

  const setViewConfigManager = useSetAtom(viewConfigManagerAtom);
  const setRegisteredViews = useSetAtom(registeredViewsAtom);
  const setGlobalConfig = useSetAtom(setGlobalConfigAtom);

  if (!_context.viewConfigManager) {
    throw new Error('useView must be used within a ViewProvider');
  }

  // CLEAN UP -> All these can be handled together and have derived atoms
  React.useEffect(() => {
    setViewConfigManager(_context.viewConfigManager);
  }, [_context.viewConfigManager, setViewConfigManager]);

  React.useEffect(() => {
    setRegisteredViews(_context.registeredViews);
  }, [_context.registeredViews, setRegisteredViews]);

  React.useEffect(() => {
    setGlobalConfig(globalConfig.config);
  }, [globalConfig.config, setGlobalConfig]);

  return _context;
};
