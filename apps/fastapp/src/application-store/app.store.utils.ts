import { views } from '@apps-next/convex';
import {
  getViewByName,
  UserViewData,
  ViewConfigType,
  ViewRegistryEntry,
} from '@apps-next/core';
import { getUserViewData } from '../query-client';
import { viewRegistry } from '@apps-next/react';

export const getViewData = (
  viewName: string
): {
  userViewData: UserViewData | null | undefined;
  viewData: ViewRegistryEntry;
} => {
  const userViewData = getUserViewData(viewName);

  let viewData = viewRegistry.getView(userViewData?.baseView ?? viewName);

  const view = getViewByName(views, viewName) as ViewConfigType;

  if (!viewData && view) {
    viewData = {
      viewConfig: view as ViewConfigType,
    };
  }

  if (!viewData.viewConfig) {
    return {
      viewData: {
        viewConfig: view,
      },
      userViewData,
    };
  }

  return { viewData, userViewData };
};
