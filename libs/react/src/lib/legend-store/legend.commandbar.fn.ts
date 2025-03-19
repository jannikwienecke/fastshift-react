import { StoreFn } from './legend.store.types';

export const commandbarOpen: StoreFn<'commandbarOpen'> = (store$) => () => {
  store$.commandbar.open.set(true);
};

export const commandbarClose: StoreFn<'commandbarClose'> = (store$) => () => {
  store$.commandbar.open.set(false);
  store$.commandbar.query.set('');
  store$.commandbar.debouncedQuery.set('');
  store$.commandbar.debouncedBy.set(0);
  store$.commandbar.itemGroups.set([]);
};
export const commandbarUpdateQuery: StoreFn<'commandbarUpdateQuery'> =
  (store$) => (query) => {
    store$.commandbar.query.set(query);
    store$.commandbar.debouncedQuery.set(query);
    store$.commandbar.debouncedBy.set(0);
  };
export const commandbarSelectItem: StoreFn<'commandbarSelectItem'> =
  (store$) => (item) => {
    console.log('onSelect', item);
  };
