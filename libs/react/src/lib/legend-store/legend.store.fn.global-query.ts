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
