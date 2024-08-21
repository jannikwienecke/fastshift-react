import { atom } from 'jotai';
import { DEFAULT_STORE, Store } from './store.type';
import { StoreAction } from './store.actions.types';

export const storeAtom = atom<Store>(DEFAULT_STORE);
storeAtom.debugLabel = 'Global Store';

export const storeReducer = (prev: Store, action: StoreAction): Store => {
  console.debug('storeReducer: ', {
    before: prev,
    action,
  });

  const handle = (): Store => {
    if (action.type === 'EDIT_RECORD') {
      return {
        ...prev,
        edit: {
          isEditing: true,
          record: action.record,
        },
      };
    }

    if (action.type === 'SAVE_UPDATED_RECORD')
      return {
        ...prev,
        edit: {
          isEditing: false,
          record: null,
        },
      };

    if (action.type === 'ADD_NEW_RECORD')
      return {
        ...prev,
        edit: {
          isEditing: true,
          record: null,
        },
      };

    throw new Error('unknown action type');
  };

  const store = handle();

  console.debug('storeReducer', {
    after: store,
  });

  return store;
};
