import { store$, viewName$ } from '@apps-next/react';

export const getDefaultMutationArgs = () => {
  const apiKey = store$.api.apiKey.get();
  if (!apiKey) {
    throw new Error('API key is not set in the store');
  }

  return {
    apiKey,
    viewName: viewName$.get(),
  };
};
