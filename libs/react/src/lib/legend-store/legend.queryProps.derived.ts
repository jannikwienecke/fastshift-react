import { observable } from '@legendapp/state';
import { store$ } from './legend.store';
import { getParsedViewSettings } from './legend.utils.helper';
import { QueryProps } from '@apps-next/core';

export const queryListViewOptions$ = observable(() => {
  const parsedViewSettings = getParsedViewSettings();

  const makeQueryOptions = store$.api.makeQueryOptions.get();
  if (!makeQueryOptions) return;

  const queryOptions = makeQueryOptions({
    // TODO FIXME
    viewName: 'task',
    query: '',
    filters: parsedViewSettings.filters,
    displayOptions: parsedViewSettings.displayOptions,
    modelConfig: undefined,
    viewConfigManager: undefined,
    registeredViews: {},
    viewId: null,
    parentId: null,
    parentViewName: null,
    paginateOptions: {
      cursor: { position: null, cursor: null },
      numItems: 35,
    },
  });

  return queryOptions;
});

export const queryDetailViewOptions$ = observable(() => {
  const makeQueryOptions = store$.api.makeQueryOptions.get();
  const viewId = store$.detail.row.id.get();

  if (!makeQueryOptions) return;
  if (!viewId) return;

  const queryOptions = makeQueryOptions({
    viewName: 'task',
    query: '',
    filters: '',
    displayOptions: '',
    registeredViews: {},
    viewId,
  });

  return queryOptions;
});
