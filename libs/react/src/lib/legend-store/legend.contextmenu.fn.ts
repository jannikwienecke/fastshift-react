import { StoreFn } from './legend.store.types';

export const contextMenuOpen: StoreFn<'contextMenuOpen'> =
  (store$) => (rect) => {
    console.log('TEST open', rect);

    store$.contextMenuState.rect.set(rect);
  };

export const contextMenuClose: StoreFn<'contextMenuClose'> = (store$) => () => {
  console.log('TEST close');

  store$.contextMenuState.rect.set(null);
};
