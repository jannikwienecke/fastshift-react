import { batch } from '@legendapp/state';
import { StoreFn } from './legend.store.types';

let timeout: NodeJS.Timeout;
export const globalQueryUpdate: StoreFn<'globalQueryUpdate'> =
  (store$) => (query) => {
    store$.globalQuery.set(query);

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      store$.globalQueryDebounced.set(query);
    }, 300);
  };

export const globalQueryReset: StoreFn<'globalQueryReset'> = (store$) => () => {
  store$.globalQuery.set('');
};

export const globalFetchMore: StoreFn<'globalFetchMore'> = (store$) => () => {
  if (store$.fetchMore.isDone.get()) return;

  console.log('FETCH MORE');
  batch(() => {
    store$.fetchMore.set((prev) => ({
      ...prev,
      currentCursor: prev.nextCursor,
      isFetching: true,
      isFetched: false,
    }));
  });
};
