import React from 'react';
import { comboboxStore$, store$ } from './legend-store';
import { useQuery } from './use-query';

export const useComboboxQuery = () => {
  const store = comboboxStore$.get();
  const { data } = useQuery({
    query: store.query,
    relationQuery: {
      tableName: store.tableName ?? '',
    },
    disabled:
      !store.field ||
      !store.query ||
      !!store.field.enum ||
      store.field.type === 'Date',
  });

  React.useEffect(() => {
    if (!data) return;
    store$.comboboxHandleQueryData(data ?? []);
  }, [data]);
};
