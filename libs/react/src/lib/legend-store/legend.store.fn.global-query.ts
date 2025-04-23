import { batch } from '@legendapp/state';
import { StoreFn } from './legend.store.types';
import { _log } from '@apps-next/core';

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
  _log.debug('Pagination: fetchMore...', store$.fetchMore.get());
  if (store$.fetchMore.isDone.get()) return;

  const state = store$.state.get();
  if (
    state === 'fetching-more' ||
    state === 'filter-changed' ||
    state === 'updating-display-options'
  ) {
    _log.debug('Not fetching more: State is ', state);
    return;
  }

  batch(() => {
    store$.state.set('fetching-more');

    store$.fetchMore.set((prev) => ({
      ...prev,
      currentCursor: prev.nextCursor,
    }));
  });
};
