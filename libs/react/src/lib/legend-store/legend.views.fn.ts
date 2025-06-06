import { StoreFn } from './legend.store.types';

export const updateUserViews: StoreFn<'updateUserViews'> =
  (store$) => (userViewData) => {
    const count = store$.ignoreNextUserViewData.get();

    if (count > 1) {
      store$.ignoreNextUserViewData.set((prev) => prev - 1);
      return;
    }

    store$.ignoreNextUserViewData.set(0);
    store$.userViews.set(userViewData);
  };
