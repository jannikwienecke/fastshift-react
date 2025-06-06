import {
  _log,
  getViewByName,
  MakeDetailPropsOption,
  UiViewConfig,
  ViewConfigType,
  ViewRegistry,
  ViewRegistryEntry,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';

export const resettingDb$ = observable(false);

const viewsConfigStore = observable<{
  [key: string]: ViewRegistryEntry;
}>({});

const addView = <T extends ViewConfigType<any>>(config: T) => {
  _log.debug('viewsConfigStore:addView', config.viewName);

  viewsConfigStore.set({
    ...viewsConfigStore.get(),
    [config.viewName.toLowerCase()]: { viewConfig: config },
  });

  const addComponents = (components: {
    main?: (props: { isSubView?: boolean }) => React.ReactNode;
    detail?: (options: MakeDetailPropsOption) => React.ReactNode;
    overView?: (options: MakeDetailPropsOption) => React.ReactNode;
  }) => {
    viewsConfigStore.set({
      ...viewsConfigStore.get(),
      [config.viewName.toLowerCase()]: {
        ...viewsConfigStore.get()[config.viewName.toLowerCase()],
        ...components,
      },
    });
    return storeFn;
  };

  const addUiConfig = (uiViewConfig: UiViewConfig) => {
    viewsConfigStore.set({
      ...viewsConfigStore.get(),
      [config.viewName.toLowerCase()]: {
        ...viewsConfigStore.get()[config.viewName.toLowerCase()],
        uiViewConfig,
      },
    });
    return storeFn;
  };

  const storeFn = {
    addComponents,
    addUiConfig,
  };

  return storeFn;
};

const getView = (name: string): ViewRegistryEntry => {
  const store = viewsConfigStore.get();
  const found = Object.entries(store).find(([key, value]) => {
    return (
      key === name.toLowerCase() ||
      value.viewConfig.tableName.toLowerCase() === name.toLowerCase() ||
      value.viewConfig.viewName.toLowerCase() === name.toLowerCase()
    );
  });

  if (!found) {
    const config = getViewByName(store$.views.get(), name.toLowerCase());
    if (!config) {
      console.debug('getView: NOT FOUND !!!!', name);
      console.debug(store$.views.get());
      console.trace();

      throw new Error(`View not found: :${name}`);
    }
    return {
      viewConfig: config,
    };
  }

  return found[1];
};

const getViews = () => {
  return viewsConfigStore.get();
};

export const viewRegistry: ViewRegistry = {
  addView,
  getView,
  getViews,
};
