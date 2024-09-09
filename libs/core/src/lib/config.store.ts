import { atom, createStore } from 'jotai';
import { registeredViewsServerAtom } from './registered-view.store';
import {
  GetTableName,
  RecordType,
  RegisteredRouter,
  RegisteredViews,
  ViewConfigType,
} from './types';
import { viewConfigManagerAtom } from './view-config.store';

export type ComponentType = 'list' | 'combobox';

export type ViewFieldsConfig<
  T extends GetTableName = any,
  U extends RecordType = any
> = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  [key in T]: {
    fields: Partial<{
      [key in keyof U]: {
        component?: Partial<{
          // [key in ComponentType]: (props: { data: Row<U> }) => React.ReactNode;
          list: (props: { data: U }) => React.ReactNode;
          combobox: (props: {
            data: U[key] extends Array<unknown> ? U[key][0] : U[key];
          }) => React.ReactNode;
        }>;
      };
    }>;
  };
};

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
