import {
  BaseConfigInterface,
  BaseViewConfigManagerInterface,
  RecordType,
  RegisteredRouter,
  RegisteredViews,
  ViewConfigType,
  ViewFieldsConfig,
} from '@apps-next/core';
import { atom, createStore } from 'jotai';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AtomStore = any;

export const clientViewConfigAtom = atom({} as ViewFieldsConfig);

export const getViewFieldsConfig = () =>
  clientConfigStore.get(clientViewConfigAtom);

export const setViewFieldsConfig = <T extends RecordType>(
  table: keyof RegisteredRouter['config']['_datamodel'],
  data: ViewFieldsConfig<
    keyof RegisteredRouter['config']['_datamodel'],
    T
  >[keyof RegisteredRouter['config']['_datamodel']]
) => {
  clientConfigStore.set(clientViewConfigAtom, (prev: any) => ({
    ...prev,
    [table]: data,
  }));
};

export const clientConfigAtom = atom((get) => {
  const viewConfig = get(viewConfigManagerAtom);
  const clientConfigView = get(clientViewConfigAtom);

  // TODO: This must have the option to get it by the viewName as well
  return clientConfigView[viewConfig?.getTableName() ?? ''];
});

export const clientConfigStore: AtomStore = createStore();
export const registeredViewsServerStore: AtomStore = createStore();

export const registerView = (viewName: string, viewConfig: ViewConfigType) => {
  registeredViewsServerStore.set(registeredViewsServerAtom, (prev: any) => ({
    ...prev,
    [viewName]: viewConfig,
  }));
};

export const getViews = (): RegisteredViews => {
  const registeredViews = registeredViewsServerStore.get(
    registeredViewsServerAtom
  );

  return registeredViews;
};

export const registeredViewsAtom = atom<RegisteredViews>({});
export const registeredViewsServerAtom = atom<RegisteredViews>({});

export const mergeRegisteredViews = (
  rv1: RegisteredViews,
  rv2: RegisteredViews
) => {
  const xx = Object.keys(rv1).reduce((acc, key) => {
    const view1 = rv1[key];
    const view2 = rv2[key];

    if (view1?._generated && view2?._generated) {
      return {
        ...acc,
        [key]: view1,
      };
    }

    if (view1?._generated && view2) {
      return {
        ...acc,
        [key]: view2,
      };
    }

    if (view1 && view2?._generated) {
      return {
        ...acc,
        [key]: view1,
      };
    }

    return {
      ...acc,
      [key]: view2 ?? view1,
    };
  }, {} as RegisteredViews);

  return xx;
};

export const globalConfigAtom = atom<BaseConfigInterface>(
  {} as BaseConfigInterface
);

export const viewConfigManagerAtom =
  atom<BaseViewConfigManagerInterface | null>(null);

export const getViewConfigAtom = atom((get) => {
  const viewConfigManager = get(viewConfigManagerAtom);
  if (!viewConfigManager) {
    throw new Error('View config manager not found');
  }
  return viewConfigManager;
});
