import {
  _log,
  convertDisplayOptionsForBackend,
  convertFiltersForBackend,
  DEFAULT_FETCH_LIMIT_QUERY,
  getViewByName,
  Row,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { renderErrorToast } from '../toast';
import { applyDisplayOptions } from './legend.local.display-options';
import { applyFilter } from './legend.local.filtering';
import { store$ } from './legend.store';

export const filterRowsByShowDeleted = (rows: Row[]) => {
  const showDeleted = store$.displayOptions.showDeleted.get();
  const softDeleteField =
    store$.viewConfigManager.getSoftDeleteIndexField()?.field;

  const filtered = rows.filter((row) => {
    if (showDeleted) return true;

    const value = softDeleteField && row.getValue(softDeleteField ?? '');
    return showDeleted ? true : value !== true;
  });

  return filtered;
};

const filterRowsByParentId = (rows: Row[]) => {
  const parentId = store$.detail.row.id.get();
  const parentViewName = store$.detail.parentViewName.get();

  if (!parentId || !parentViewName) return rows;
  const parentTableName = getViewByName(
    store$.views.get(),
    parentViewName
  )?.tableName;

  if (!parentTableName) return rows;

  return rows.filter((row) => {
    const value = row.raw?.[parentTableName];

    if (!value) return true;
    if (!value?.id) return true;

    const id = value.id;
    if (id === parentId) return true;

    return false;
  });
};

export const setGlobalDataModel = (rows: Row[]) => {
  // if (store$.detail.form.dirtyValue.get()) {
  //   console.warn('DOES NOT UPDATE IS DIRY!!', store$.detail.form.get());
  //   return;
  // }

  rows = filterRowsByParentId(rows);

  const filteredRows = filterRowsByShowDeleted(rows);

  //   datamodel has either ALL or not DELETED rows based on the config
  store$.dataModel.set((prev) => {
    return {
      ...prev,
      rows: filteredRows,
    };
  });

  //   backup has ALL rows
  store$.dataModelBackup.rows.set(rows);

  const isDone_ =
    DEFAULT_FETCH_LIMIT_QUERY > store$.dataModel.rows.get().length;

  if (localModeEnabled$.get() || isDone_) {
    _log.debug('setGlobalDataModel: APPLY FILTER! AND SORT');
    applyFilter(store$, store$.filter.filters.get());
    applyDisplayOptions(store$, store$.displayOptions.get());
  }
};

export const getParsedViewSettings = () => {
  const filters = store$.filter.filters.get();
  const displayOptions = store$.displayOptions.get();

  const parsedDisplayOptions = convertDisplayOptionsForBackend(displayOptions);

  return {
    filters: convertFiltersForBackend(filters),
    displayOptions: parsedDisplayOptions,
  } satisfies {
    filters?: string;
    displayOptions?: string;
  };
};

export const localModeEnabled$ = observable(() => {
  const parentViewName = store$.detail.parentViewName.get();

  console.warn(
    'localModeEnabled$',
    store$.viewConfigManager.viewConfig.localMode.get() || parentViewName
  );
  return (
    store$.viewConfigManager.viewConfig.localMode.enabled.get() ||
    parentViewName
  );
});

export const saveSubViewSettings = async () => {
  const parentViewName = store$.detail.parentViewName.get();
  let parentTablename =
    getViewByName(store$.views.get(), parentViewName ?? '')?.tableName ?? '';

  if (!parentTablename) {
    const userView = store$.userViews
      .find((u) => u.name.get().toLowerCase() === parentViewName?.toLowerCase())
      ?.get();
    parentTablename =
      getViewByName(store$.views.get(), userView?.baseView ?? '')?.tableName ??
      '';

    if (!parentTablename) {
      console.warn('No parent table name found');
      return;
    }
  }

  const name = `${parentTablename}|${store$.viewConfigManager.getTableName()}`;
  const hasView = store$.userViews.find((v) => v.name.get() === name)?.get();

  const result = await store$.api.mutateAsync({
    query: '',
    viewName: store$.viewConfigManager.getViewName(),
    mutation: {
      type: 'USER_VIEW_MUTATION',
      payload: {
        type: hasView ? 'UPDATE_VIEW' : 'CREATE_VIEW',
        parentModel: parentTablename,
        name,
        description: '',
        ...getParsedViewSettings(),
      },
    },
  });

  if (result.error) {
    renderErrorToast(`Error saving view: ${result.error.message}`, () => {
      console.error('Error saving view callback' + result.error.message);
      store$.errorDialog.error.set(result.error);
    });
  }
};
