import { ComboboxStoreAction } from './store.actions.types';
import { storeAtom, storeReducer } from './store.main';
import { ComboboxStore } from './store.type';
import { useReducerAtom } from '../../../../jotai-utils/use-reducer-atom';

export const useComboboxStore = () => {
  const [store, dispatch] = useReducerAtom<ComboboxStore, ComboboxStoreAction>(
    storeAtom,
    storeReducer
  );

  return [store, dispatch] as const;
};
export const useComboboxStoreValue = () => {
  const [store] = useComboboxStore();

  return store;
};

export const useComboboxStoreDispatch = () => {
  const [, dispatch] = useComboboxStore();

  return dispatch;
};
