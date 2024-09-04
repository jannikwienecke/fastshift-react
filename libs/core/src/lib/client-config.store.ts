import { atom, createStore } from 'jotai';
import {
  GetTableName,
  RecordType,
  RegisteredRouter,
  ViewConfigType,
} from './types';
import { viewConfigManagerAtom } from './view-config.store';
import {
  registeredViewsAtom,
  registeredViewsServerAtom,
} from './registered-view.store';

export type ComponentType = 'list' | 'combobox';

export type ClientViewConfig<T extends GetTableName, U extends RecordType> = {
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

export const clientViewConfigAtom = atom({} as ClientViewConfig<any, any>);

export const clientConfigStore = createStore();

// TODO: Clean up -> refacotr this function -> Naming etc.
export const setClientViewConfig = <T extends RecordType>(
  table: keyof RegisteredRouter['config']['_datamodel'],
  data: ClientViewConfig<
    keyof RegisteredRouter['config']['_datamodel'],
    T
  >[keyof RegisteredRouter['config']['_datamodel']]
) => {
  clientConfigStore.set(clientViewConfigAtom, (prev) => ({
    ...prev,
    [table]: data,
  }));
};

export const clientConfigAtom = atom((get) => {
  const viewConfig = get(viewConfigManagerAtom);
  const clientConfigView = get(clientViewConfigAtom);

  return clientConfigView[viewConfig?.getViewName() ?? ''];
});

export const registeredViewsStore = createStore();
export const registeredViewsServerStore = createStore();

export const registerView = (viewName: string, viewConfig: ViewConfigType) => {
  registeredViewsStore.set(registeredViewsAtom, (prev) => ({
    ...prev,
    [viewName]: viewConfig,
  }));
};

export const registerViewServer = (
  viewName: string,
  viewConfig: ViewConfigType
) => {
  registeredViewsServerStore.set(registeredViewsServerAtom, (prev) => ({
    ...prev,
    [viewName]: viewConfig,
  }));
};
