import { observable } from '@legendapp/state';
import { store$ } from './legend.store';
import { getParsedViewSettings } from './legend.utils.helper';

export const queryListViewOptions$ = observable(() => {
  const parsedViewSettings = getParsedViewSettings();

  const parentViewName = store$.detail.parentViewName.get();

  const makeQueryOptions = store$.api.makeQueryOptions.get();
  if (!parentViewName) return;
  if (!makeQueryOptions) return;

  const queryOptions = makeQueryOptions({
    viewName: parentViewName,
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

export const querySubListViewOptions$ = observable(() => {
  const makeQueryOptions = store$.api.makeQueryOptions.get();
  const row = store$.detail.row.get();
  const parentViewName = store$.detail.parentViewName.get();
  if (!row || !parentViewName) return;
  if (!makeQueryOptions) return;

  const queryOptions = makeQueryOptions({
    viewName: store$.viewConfigManager.getViewName(),
    query: '',
    filters: '',
    displayOptions: '',
    modelConfig: undefined,
    viewConfigManager: undefined,
    registeredViews: {},
    viewId: null,
    parentId: row.id,
    parentViewName: parentViewName,
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
