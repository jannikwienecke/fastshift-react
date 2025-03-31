import {
  _log,
  getViewByName,
  makeData,
  QueryReturnOrUndefined,
  QueryReturnType,
  RecordType,
  RelationalDataModel,
} from '@apps-next/core';
import { LegendStore, StoreFn } from './legend.store.types';
import { batch, Observable } from '@legendapp/state';
import { displayOptionsProps } from './legend.store.derived.displayOptions';

export const createRelationalDataModel: StoreFn<'createRelationalDataModel'> =
  (store$) => (data) => {
    const relationalDataModel = Object.entries(data).reduce(
      (acc, [tableName, data]) => {
        const viewConfig = getViewByName(store$.views.get(), tableName);
        const _data = makeData(store$.views.get(), viewConfig?.viewName)(data);

        acc[tableName] = _data;
        return acc;
      },
      {} as RelationalDataModel
    );

    store$.relationalDataModel.set({
      ...store$.relationalDataModel.get(),
      ...relationalDataModel,
    });
  };

export const createDataModel: StoreFn<'createDataModel'> =
  (store$) => (data) => {
    const dataModel = makeData(
      store$.views.get(),
      store$.viewConfigManager.get().getTableName?.()
    )(data);

    store$.dataModel.set(dataModel);
  };

export const init: StoreFn<'init'> =
  (store$) =>
  (
    data,
    relationalData,
    continueCursor,
    isDone,
    viewConfigManager,
    views,
    uiViewConfig,
    commands
  ) => {
    batch(() => {
      store$.fetchMore.assign({
        isDone,
        currentCursor: {
          position: null,
          cursor: null,
        },
        nextCursor: continueCursor ?? {
          position: null,
          cursor: null,
        },
        // isFetched: true,
        // isFetching: false,
      });

      store$.state.set('initialized');

      store$.views.set(views);
      store$.viewConfigManager.set(viewConfigManager);
      store$.uiViewConfig.set(uiViewConfig);
      store$.filter.filters.set([]);
      store$.commands.set(commands);

      if (!store$.viewConfigManager.get()) return;

      const viewFields = store$.viewConfigManager
        .get()
        .getViewFieldList()
        .map((field) => field.name);

      store$.displayOptions.viewField.selected.set(viewFields);
      store$.displayOptions.viewField.allFields.set(viewFields);

      store$.displayOptions.showDeleted.set(
        !!viewConfigManager.viewConfig.query?.showDeleted
      );

      store$.displayOptions.softDeleteEnabled.set(
        !!viewConfigManager.viewConfig.mutation?.softDelete
      );

      const defaultSorting =
        store$.viewConfigManager.viewConfig.query.sorting.get();

      const defaultGrouping =
        store$.viewConfigManager.viewConfig.query.grouping.get();

      const sortingField = defaultSorting?.field
        ? viewConfigManager.getFieldByRelationFieldName(
            defaultSorting.field.toString()
          )
        : undefined;

      const groupByField = defaultGrouping?.field
        ? viewConfigManager.getFieldByRelationFieldName(
            defaultGrouping.field.toString()
          )
        : undefined;

      displayOptionsProps.set({});

      store$.displayOptions.sorting.assign({
        isOpen: false,
        rect: null,
        field: sortingField,
        order: defaultSorting?.direction || 'asc',
      });
      store$.displayOptions.grouping.assign({
        isOpen: false,
        rect: null,
        field: groupByField,
      });
    });

    createDataModel(store$)(data);
    createRelationalDataModel(store$)(relationalData);
  };

const handlingFetchMoreState = async (
  store$: Observable<LegendStore>,
  queryReturn: QueryReturnType
) => {
  const newData = queryReturn.data ?? [];
  const prevData = store$.dataModel.get().rows.map((row) => row.raw);
  const all = [...prevData, ...newData];

  store$.createDataModel(all);
  store$.state.set('initialized');

  store$.fetchMore.assign({
    currentCursor: store$.fetchMore.currentCursor.get(),

    nextCursor: queryReturn.continueCursor,
    isDone: queryReturn.isDone ?? false,
  });
};

const handlingDisplayOptionsChangeState = async (
  store$: Observable<LegendStore>,
  queryReturn: QueryReturnType
) => {
  // we only want to have the new data -> discard the previous data
  const newData = queryReturn.data ?? [];
  const all = [...newData];

  store$.createDataModel(all);
  store$.state.set('initialized');

  store$.fetchMore.assign({
    currentCursor: store$.fetchMore.currentCursor.get(),
    nextCursor: queryReturn.continueCursor,
    isDone: queryReturn.isDone ?? false,
  });
};

const handleFilterChangedState = async (
  store$: Observable<LegendStore>,
  queryReturn: QueryReturnType
) => {
  // we only want to have the new data -> discard the previous data
  const newData = queryReturn.data ?? [];
  const all = [...newData];

  store$.createDataModel(all);
  store$.state.set('initialized');

  store$.fetchMore.assign({
    currentCursor: store$.fetchMore.currentCursor.get(),
    nextCursor: queryReturn.continueCursor,
    isDone: queryReturn.isDone ?? false,
  });
};

const handleMutatingState = async (
  store$: Observable<LegendStore>,
  queryReturn: QueryReturnType
) => {
  // we only want to have the new data -> discard the previous data
  const ids = queryReturn.allIds;
  const newData = queryReturn.data ?? [];
  const prevData = store$.dataModel.get().rows.map((row) => row.raw);

  const _new = prevData
    .filter((row) => {
      return ids?.some((id) => id === row.id);
    })
    .map((row) => {
      const newRow = newData.find((r) => r.id === row.id);
      if (!newRow) return row;
      else return newRow;
    });

  store$.state.set('initialized');
  store$.createDataModel(_new);

  store$.fetchMore.assign({
    currentCursor: store$.fetchMore.currentCursor.get(),
    nextCursor: queryReturn.continueCursor,
    isDone: queryReturn.isDone ?? false,
  });
};

export const handleIncomingData: StoreFn<'handleIncomingData'> =
  (store$) => async (data) => {
    const state = store$.state.get();
    switch (state) {
      case 'fetching-more':
        _log.debug('RECEIVING DATA AFTER FETCHING MORE', data);
        await handlingFetchMoreState(store$, data);
        break;

      case 'updating-display-options':
        _log.debug('RECEIVING DATA AFTER UPDATING DISPLAY OPTIONS');
        await handlingDisplayOptionsChangeState(store$, data);
        break;

      case 'filter-changed':
        _log.debug('RECEIVING DATA AFTER FILTER CHANGED');
        await handleFilterChangedState(store$, data);
        break;

      case 'mutating':
        _log.debug('====RECEIVING DATA AFTER MUTATION');
        handleMutatingState(store$, data);
        break;

      case 'initialized':
        _log.debug('RECEIVING DATA AFTER INITIALIZED -> Do NOTHING');
        break;

      default:
        break;
    }
  };
