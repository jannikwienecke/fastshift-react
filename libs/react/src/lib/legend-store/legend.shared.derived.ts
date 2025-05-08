import { observable } from '@legendapp/state';
import { store$ } from './legend.store';
import {
  getUserViewByName,
  getViewByName,
  ViewConfigType,
} from '@apps-next/core';

export const currentView$ = observable(() => {
  return store$.viewConfigManager.viewConfig.get();
});

export const userViews$ = observable(() => store$.userViews.get());

export const getUserView = (viewName: string) => {
  return getUserViewByName(userViews$.get(), viewName);
};

export const getView = (viewName: string) => {
  return getViewByName(store$.views.get(), viewName);
};

export const parentView$ = observable(() => {
  const parentViewName = store$.detail.parentViewName.get();

  if (!parentViewName) return null;

  let parentView = getView(parentViewName);

  if (parentView) return parentView as ViewConfigType;

  const userView = getUserView(parentViewName);

  parentView = getView(userView?.baseView ?? '');

  if (!parentView) return null;

  return parentView as ViewConfigType;
});
