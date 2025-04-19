import { views } from '@apps-next/convex';
import { getViewByName, ViewConfigType } from '@apps-next/core';
import { getUserViewData } from '../query-client';
import { viewStore } from './app.store';

export const getViewData = (viewName: string) => {
  const userViewData = getUserViewData(viewName);

  let viewData = viewStore.getView(userViewData?.baseView ?? viewName);

  const view = getViewByName(views, viewName) as ViewConfigType;

  if (!viewData && view) {
    viewData = {
      viewConfig: view as any,
    };
  }

  return { viewData, userViewData };
};
