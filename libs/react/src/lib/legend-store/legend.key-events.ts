import { Observable } from '@legendapp/state';
import { LegendStore } from './legend.store.types';

export const addKeyEvents = (store$: Observable<LegendStore>) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const handleEscape = () => {
      console.debug('Escape key pressed, handling escape...');
      store$.pageHeader.showSearchInput.set(false);
      store$.datePickerDialogClose();
    };

    if (event.key === 'Escape') {
      handleEscape();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
};
