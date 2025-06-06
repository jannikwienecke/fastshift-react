import { observable } from '@legendapp/state';
import { store$ } from './legend.store';
import {
  ComponentType,
  getUserViewByName,
  getViewByName,
  getViewLabel,
  ViewConfigType,
} from '@apps-next/core';
import { viewRegistry } from './legend.app.registry';
import { isDetail } from './legend.utils';

export const currentView$ = observable(() => {
  return store$.viewConfigManager?.viewConfig?.get() as ViewConfigType;
});

export const detailView$ = observable(() => {
  return store$.detail?.viewConfigManager?.viewConfig.get() as
    | ViewConfigType
    | undefined;
});

export const userViews$ = observable(() => store$.userViews.get());

export const userView$ = observable(() => store$.userViewData.get());

export const view$ = observable(() => {
  if (isDetail()) return detailView$.get();
  return currentView$.get();
});

export const tablename$ = observable(() => {
  return view$.get()?.tableName;
});

export const viewName$ = observable(() => {
  const view = view$.get();
  if (!view) return '';
  return view.viewName;
});

export const tablenameLabel$ = observable(() => {
  const view = view$.get();
  if (!view) return '';
  return getViewLabel(view ?? '', true);
});

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
  return (
    parentUserView$.get()?.name ??
    parentView$.get()?.viewName.toString().firstUpper() ??
    ''
  );
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

export const uiViewConfigDict$ = observable(() => {
  store$.views.get();

  const getUiViewConfig = () => {
    return Object.entries(viewRegistry.getViews())
      .map(([key, v]) => v.uiViewConfig?.[key]['fields'])
      .reduce((acc, fields) => {
        const innerDict = Object.entries(fields ?? {}).reduce(
          (acc, [fieldName, field]) => {
            if (!field) return acc;
            if (!fieldName) return acc;

            if (acc[fieldName]) {
              acc[fieldName] = {
                ...acc[fieldName],
                ...field?.component,
              };
            } else if (field.component && fieldName) {
              acc[fieldName] = {
                ...field.component,
              };
            }

            return { ...acc };
          },
          {} as Record<
            string,
            Partial<Record<ComponentType, React.FC<any> | undefined>>
          >
        );

        return {
          ...acc,
          ...innerDict,
        };
      }, {} as Record<string, Partial<Record<ComponentType, React.FC<any> | undefined>>>);
  };
  return getUiViewConfig();
});
