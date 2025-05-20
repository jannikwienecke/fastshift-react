import {
  RecordType,
  RegisteredRouter,
  ViewConfig,
  UiViewConfig,
} from '@apps-next/core';

export * from './lib/ui-components';
export * from './lib/use-query';
export * from './lib/use-view';
export * from './lib/ui-adapter';
export * from './lib/use-mutation';
export * from './lib/make-hooks';
export * from './lib/ui-components/render-combobox-field-value';
export * from './lib/query-context';
export * from './lib/client-view-provider-convex';
export * from './lib/generate-default-config';
export * from './lib/ui-adapter/filter-adapter';
export * from './lib/ui-adapter/input-dialog';
export * from './lib/legend-store';
export * from './lib/create-view-config';
export * from './lib/use-combobox-query';
export * from './lib/toast';
// export * from './lib/legend-store/legend.store.global';

export const makeViewFieldsConfig = <T extends RecordType>(
  table: keyof RegisteredRouter['config']['_datamodel'],
  data: UiViewConfig<
    keyof RegisteredRouter['config']['_datamodel'],
    T
  >[keyof RegisteredRouter['config']['_datamodel']]
) => {
  // clientConfigStore.set(clientViewConfigAtom, (prev: any) => ({
  //   ...prev,
  //   [table]: data,
  // }));
  return {
    [table]: data,
  };
};

export const makeViewConfig = <T extends RecordType>(
  table: keyof RegisteredRouter['config']['_datamodel'],
  data: ViewConfig<T>
) => {
  return {
    [table]: data,
  };
};
