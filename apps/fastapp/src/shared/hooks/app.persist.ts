import { perstistedStore$ } from '@apps-next/react';
import { observable } from '@legendapp/state';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { syncObservable } from '@legendapp/state/sync';

export const localStore$ = observable<{
  activeTabFieldName?: string;
  isActivityTab?: boolean;
  updatedAt: number;
}>({
  updatedAt: Date.now(),
});

export const hydradatedStore$ = observable(false);

if (localStorage.getItem('test') !== 'true') {
  console.debug('Persisting State to Local Storage');
  syncObservable(localStore$, {
    persist: {
      name: 'local-store-state',
      plugin: ObservablePersistLocalStorage,
    },
  });
} else {
  console.warn('Not Persisting State to Local Storage in Test Mode...');
}

perstistedStore$.onChange((changes) => {
  const value = changes.value;
  if (!hydradatedStore$.get()) return;

  localStore$.set({
    ...value,
    updatedAt: Date.now(),
  });
});
