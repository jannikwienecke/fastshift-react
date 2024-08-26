import { atom, createStore } from 'jotai';
import { DataRow } from './query-store';
import { GetTableName, GetTableDataType, RegisteredRouter } from './types';
import { viewConfigManagerAtom } from './view-config.store';

type ClientViewConfig<T extends GetTableName> = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  [key in T]: {
    fields: Partial<{
      [key in keyof GetTableDataType<T>]: {
        component: (props: {
          data: DataRow<GetTableDataType<T>>;
        }) => React.ReactNode;
      };
    }>;
  };
};

export const clientViewConfigAtom = atom({} as ClientViewConfig<any>);

export const clientConfigStore = createStore();

export const setClientViewConfig = <
  T extends keyof RegisteredRouter['config']['_datamodel']
>(
  table: T,
  data: ClientViewConfig<T>[T]
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
