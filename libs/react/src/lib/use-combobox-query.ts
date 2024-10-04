import React from 'react';
import { comboboxStore$, store$ } from './legend-store';
import { useQuery } from './use-query';

export const useComboboxQuery = () => {
  const store = comboboxStore$.get();

  const disabled =
    !store.field ||
    !store.query ||
    !!store.field.enum ||
    store.field.type === 'Date' ||
    store.field.type === 'Boolean' ||
    (store$.filter.open.get() && !store.field);

  const { data } = useQuery({
    query: store.query,
    relationQuery: {
      tableName: store.tableName ?? '',
    },
    disabled,
  });

  React.useEffect(() => {
    if (disabled) return;
    if (!data) return;

    store$.comboboxHandleQueryData(data ?? []);
  }, [data, disabled]);
};
