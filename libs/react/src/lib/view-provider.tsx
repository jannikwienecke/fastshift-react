'use client';

import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  globalConfigAtom,
  mergeRegisteredViews,
  registeredViewsAtom,
  registeredViewsServerAtom,
  viewConfigManagerAtom,
  ViewConfigType,
} from '@apps-next/core';
import { useAtomValue } from 'jotai';
import React from 'react';
import { HydrateAtoms } from './ui-components';

export const ViewProvider = ({
  children,
  view,
}: {
  children: React.ReactNode;
  view: { viewConfigManager: BaseViewConfigManagerInterface };
}) => {
  const { tableName } = view.viewConfigManager.viewConfig;
  const config = useAtomValue(globalConfigAtom);

  const searchableFields = config.searchableFields[tableName];
  const viewFields = config.viewFields[tableName];
  const includeFields = config.includeFields[tableName];

  const registeredViewsClient = useAtomValue(registeredViewsAtom);
  const registeredViews = useAtomValue(registeredViewsServerAtom);

  const viewConfig: ViewConfigType = React.useMemo(() => {
    return {
      ...view.viewConfigManager.viewConfig,
      viewFields,
      includeFields,
      query: {
        searchableFields,
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchedRegisteredViews = React.useMemo(() => {
    return {
      ...mergeRegisteredViews(registeredViews, registeredViewsClient),
      [viewConfig.viewName || '']: viewConfig,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const viewConfigManager = new BaseViewConfigManager(viewConfig);

  return (
    <HydrateAtoms
      initialValues={[
        [viewConfigManagerAtom, viewConfigManager],
        [registeredViewsAtom, patchedRegisteredViews],
      ]}
    >
      {children}
    </HydrateAtoms>
  );
};
