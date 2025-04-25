import { UserViewData, ViewRegistryEntry } from '@apps-next/core';
import { viewRegistry } from '@apps-next/react';

const isDev = import.meta.env.MODE === 'development';
export const wait = () => {
  if (!isDev) {
    console.warn('wait() is only for development purposes');
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 300);
  });
};

export const getViewData = (
  viewName: string,
  userViews: UserViewData[] = []
): {
  userViewData: UserViewData | null | undefined;
  viewData: ViewRegistryEntry;
} => {
  const userViewData = userViews.find((view) => view.name === viewName);

  const viewData = viewRegistry.getView(userViewData?.baseView ?? viewName);

  return { viewData, userViewData };
};
