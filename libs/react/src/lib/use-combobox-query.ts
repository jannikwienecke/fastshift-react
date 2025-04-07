import React from 'react';
import { comboboxStore$, store$ } from './legend-store';
import { useQuery } from './use-query';
import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  ViewConfigType,
} from '@apps-next/core';
import { observable } from '@legendapp/state';

const viewConfigManager$ = observable(() => {
  const view = store$.commandform.view.get();
  if (!view) return null;

  const viewConfigManager = new BaseViewConfigManager(
    view as ViewConfigType,
    {}
  );

  return viewConfigManager as BaseViewConfigManagerInterface;
});

export const useComboboxQuery = () => {
  const store = comboboxStore$.get();
  const viewConfigManager = viewConfigManager$.get();

  const disabled =
    !store.field ||
    !store.query ||
    !!store.field.enum ||
    store.field.type === 'Date' ||
    store.field.type === 'Boolean' ||
    (store$.filter.open.get() && !store.field);

  const { data } = useQuery({
    viewName: store$.commandform.view.get()?.viewName,
    viewConfigManager: viewConfigManager ?? undefined,
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
