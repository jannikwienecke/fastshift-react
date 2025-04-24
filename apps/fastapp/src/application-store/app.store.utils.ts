import { UserViewData, ViewRegistryEntry } from '@apps-next/core';
import { viewRegistry } from '@apps-next/react';

export const getViewData = (
  viewName: string,
  userViews: UserViewData[] = []
): {
  userViewData: UserViewData | null | undefined;
  viewData: ViewRegistryEntry;
} => {
  const userViewData = userViews.find((view) => view.name === viewName);

  const viewData = viewRegistry.getView(userViewData?.baseView ?? viewName);

  // if (!viewData && view) {
  //   viewData = {
  //     viewConfig: view as ViewConfigType,
  //   };
  // }

  // if (!viewData.viewConfig) {
  //   return {
  //     viewData: {
  //       viewConfig: view,
  //     },
  //     userViewData,
  //   };
  // }

  return { viewData, userViewData };
};
