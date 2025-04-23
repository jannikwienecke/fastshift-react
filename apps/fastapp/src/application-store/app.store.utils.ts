import { views } from '@apps-next/convex';
import { getViewByName, ViewConfigType } from '@apps-next/core';
import { getUserViewData } from '../query-client';
import { viewRegistry } from '@apps-next/react';

export const getViewData = (viewName: string) => {
  const userViewData = getUserViewData(viewName);

  let viewData = viewRegistry.getView(userViewData?.baseView ?? viewName);

  const view = getViewByName(views, viewName) as ViewConfigType;

  if (!viewData && view) {
    viewData = {
      viewConfig: view as any,
    };
  }

  return { viewData, userViewData };
};
