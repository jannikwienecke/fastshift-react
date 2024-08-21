import React from 'react';
import { useStoreValue } from './store-adapter';

export const useStoreEffects = () => {
  const store = useStoreValue();

  React.useEffect(() => {
    console.log('useStoreEffects', store);
  }, [store.edit]);
};
