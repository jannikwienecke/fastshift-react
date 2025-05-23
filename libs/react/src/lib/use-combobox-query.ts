import React from 'react';
import { comboboxStore$, store$ } from './legend-store';
import { useQuery } from './use-query';
import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  getViewByName,
  ViewConfigType,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { isDetail } from './legend-store/legend.utils';
import { derviedDetailPage$ } from './legend-store/legend.detailpage.derived';

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

  const activeTabField = derviedDetailPage$.tabs.activeTabField.get();
  const useTabsForComboboxQuery = store$.detail.useTabsForComboboxQuery.get();
  const activeTabViewName = useTabsForComboboxQuery
    ? getViewByName(store$.views.get(), activeTabField?.field?.name ?? '')
        ?.viewName
    : null;

  const disabled =
    !store.field ||
    !store.query ||
    !!store.field.enum ||
    store.field.type === 'Date' ||
    store.field.type === 'Boolean' ||
    (store$.filter.open.get() && !store.field);

  const formViewName = store$.commandform.view.get()?.viewName;
  const viewName = //  DETAIL BRANCHING
    activeTabViewName
      ? activeTabViewName
      : formViewName
      ? formViewName
      : isDetail()
      ? store$.detail.parentViewName.get()
      : undefined;

  const { data } = useQuery({
    viewName,
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
