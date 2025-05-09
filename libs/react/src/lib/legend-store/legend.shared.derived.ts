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

export const detailView$ = observable(() => {
  return store$.detail.viewConfigManager.viewConfig.get();
});

export const userViews$ = observable(() => store$.userViews.get());

export const userView$ = observable(() => store$.userViewData.get());

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

  if (!userView) {
    console.log('PARENT VIEW NOT FOUND', parentViewName);
    return null;
  }

  parentView = getView(userView?.baseView ?? '');

  if (!parentView) return null;

  return parentView as ViewConfigType;
});

export const parentUserView$ = observable(() => {
  const parentViewName = store$.detail.parentViewName.get();

  if (!parentViewName) return null;

  const userView = getUserView(parentViewName);

  if (!userView) return null;

  return userView;
});

export const parentViewName$ = observable(() => {
  return parentUserView$.get()?.name ?? store$.detail.parentViewName.get();
});

export const detailRow$ = observable(() => {
  return store$.detail.row.get();
});
export const detailLabel$ = observable(() => {
  return store$.detail.row.label.get();
});

export const detailUserView$ = observable(() => {
  const currentView = store$.userViews
    .find((v) => v.rowId.get() && v.rowId.get() === detailRow$.get()?.id)
    ?.get();

  return currentView;
});
