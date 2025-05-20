import { perstistedStore$ } from '@apps-next/react';
import { observable } from '@legendapp/state';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { syncObservable } from '@legendapp/state/sync';
import { isDev } from '../../application-store/app.store.utils';
export const localStore$ = observable<{
  activeTabFieldName?: string;
  isActivityTab?: boolean;
  updatedAt: number;
}>({
  updatedAt: Date.now(),
});

export const hydradatedStore$ = observable(false);

if (!isDev) {
  syncObservable(localStore$, {
    persist: {
      name: 'local-store',
      plugin: ObservablePersistLocalStorage,
    },
  });
}

perstistedStore$.onChange((value) => {
  if (!hydradatedStore$.get()) return;

  localStore$.set({
    ...value.value,
    updatedAt: Date.now(),
  });
});
