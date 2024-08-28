import { atom, createStore } from 'jotai';
import { DataRow } from './query-store';
import {
  GetTableName,
  GetTableDataType,
  RegisteredRouter,
  RecordType,
} from './types';
import { viewConfigManagerAtom } from './view-config.store';

export type ClientViewConfig<T extends GetTableName, U extends RecordType> = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  [key in T]: {
    fields: Partial<{
      [key in keyof U]: {
        component?: {
          list?: (props: { data: DataRow<U> }) => React.ReactNode;
          combobox?: (props: { data: DataRow<U> }) => React.ReactNode;
        };
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
