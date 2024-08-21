import { useReducerAtom } from '../jotai-utils/use-reducer-atom';
import { RecordType } from '../types';
import { StoreAction } from './store.actions.types';
import { storeAtom, storeReducer } from './store.main';
import { Store } from './store.type';

export const useStore = () => {
  const [store, dispatch] = useReducerAtom<Store, StoreAction>(
    storeAtom,
    storeReducer
  );

  return [store, dispatch] as const;
};
export const useStoreValue = () => {
  const [store] = useStore();

  return store;
};

export const useStoreDispatch = () => {
  const [, dispatch] = useStore();

  return dispatch;
};
