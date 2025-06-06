import { Observable } from '@legendapp/state';
import { LegendStore } from './legend.store.types';

export const addKeyEvents = (store$: Observable<LegendStore>) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const handleEscape = () => {
      console.debug('Escape key pressed, handling escape...');
      store$.pageHeader.showSearchInput.set(false);
      store$.datePickerDialogClose();
    };

    const handleCommandF = () => {
      console.debug('Command + F pressed, toggling search input...');
      store$.pageHeader.showSearchInput.set(
        !store$.pageHeader.showSearchInput.get()
      );
    };

    if (event.key === 'Escape') {
      handleEscape();
    }

    // if we click command and f
    if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
      event.preventDefault(); // Prevent default browser search
      handleCommandF();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
};
