import { views } from '@apps-next/convex';
import {
  getViewByName,
  UserViewData,
  ViewRegistryEntry,
} from '@apps-next/core';
import { getSubUserView, store$, viewRegistry } from '@apps-next/react';
import { observable } from '@legendapp/state';

export const isDev = import.meta.env.MODE === 'development';
export const wait = () => {
  if (!isDev) {
    console.warn('wait() is only for development purposes');
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 0);
  });
};

export const getViewData = (
  viewName: string
): {
  userViewData: UserViewData | null | undefined;
  viewData: ViewRegistryEntry;
} => {
  const userViewData = store$.userViews
    .get()
    .find((view) => view.name.toLowerCase() === viewName.toLowerCase());

  const viewData = viewRegistry.getView(userViewData?.baseView || viewName);

  return { viewData, userViewData };
};

export const getSubModelViewData = (model: string, parentModel: string) => {
  // const model = ctx.params.model;
  const modelView = getViewByName(views, model);

  if (!modelView) throw new Error('NOT VALID MODEL');

  const { viewData } = getViewData(modelView.viewName);

  const userViewData = getSubUserView(modelView);

  return { viewData, userViewData };
};

export const isInDetailView$ = observable(false);
