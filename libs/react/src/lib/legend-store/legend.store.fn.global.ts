import {
  _log,
  configManager,
  getViewByName,
  makeData,
  QueryReturnType,
  RelationalDataModel,
  sortRows,
} from '@apps-next/core';
import { batch, Observable } from '@legendapp/state';
import { LegendStore, StoreFn } from './legend.store.types';
import { setGlobalDataModel } from './legend.utils.helper';

export const openSpecificModal: StoreFn<'openSpecificModal'> =
  (store$) => (type, openCb) => {
    // store$.contextMenuOpen
    const dict: {
      [key: string]: {
        close: () => void;
        state?: () => Observable;
      };
    } = {
      commandbar: {
        close: store$.commandbarClose,
        state: () => store$.commandbar.open,
      },
      commandform: {
        close: store$.commandformClose,
        state: () => store$.commandform.open,
      },
      combobox: {
        close: store$.comboboxClose,
      },
      filter: {
        close: store$.filterClose,
        state: () => store$.filter.open,
      },
      displayoptions: {
        close: store$.displayOptionsClose,
        state: () => store$.displayOptions.isOpen,
      },
      contextmenu: {
        close: store$.contextMenuClose,
        state: () => store$.contextMenuState.row,
      },
    };

    const hasOpenState = Object.entries(dict).reduce((acc, [key, value]) => {
      if (acc === true) return acc;

      if (key !== type) {
        const state = value.state?.().get() ?? false;
        return !!state;
      }

      return acc;
    }, false as boolean);

    if (hasOpenState) {
      const allClose = Object.entries(dict).reduce((acc, [key, value]) => {
        if (key !== type) {
          return [...acc, value.close];
        }
        return acc;
      }, [] as (() => void)[]);

      batch(() => {
        allClose.forEach((close) => close());
      });
    }

    setTimeout(
      () => {
        openCb();
      },
      hasOpenState ? 250 : 0
    );
  };

export const createRelationalDataModel: StoreFn<'createRelationalDataModel'> =
  (store$) => (data) => {
    const relationalDataModel = Object.entries(data).reduce(
      (acc, [tableName, data]) => {
        const viewConfig = getViewByName(store$.views.get(), tableName);
        const view = viewConfig?.viewName;
        if (!view) return acc;
        const _data = makeData(store$.views.get(), view)(data);

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
  (store$) => (data, tableName) => {
    const sorting = store$.displayOptions.sorting.get();
    const sorted = sortRows(data, store$.views.get(), {
      field: sorting.field,
      order: sorting.order,
    });

    const dataModel = makeData(
      store$.views.get(),
      tableName ?? store$.viewConfigManager.get().getTableName?.()
    )(sorted);

    setGlobalDataModel(dataModel.rows);
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
    commands,
    userViewData,
    viewId
  ) => {
    batch(() => {
      store$.userViewSettings.initialSettings.set(null);
      store$.userViewSettings.hasChanged.set(false);

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
      });

      store$.views.set(views);
      store$.viewConfigManager.set(viewConfigManager);
      uiViewConfig && store$.uiViewConfig.set(uiViewConfig);
      store$.filter.filters.set([]);
      store$.commands.set(commands);

      store$.userViewData.set(userViewData);

      if (!store$.viewConfigManager.get()) return;

      _log.debug('INIT DATA MODEL', data.length, Object.keys(relationalData));

      createDataModel(store$)(data);
      createRelationalDataModel(store$)(relationalData);

      const { filters, dispplayOptions } = configManager(
        viewConfigManager.viewConfig
      ).mergeAndCreate(userViewData);

      store$.filter.filters.set(filters);
      store$.displayOptions.set(dispplayOptions);
      store$.viewId.set(viewId);

      store$.displayOptions.softDeleteEnabled.set(
        !!viewConfigManager.viewConfig.mutation?.softDelete
      );

      const viewFields = store$.viewConfigManager
        .get()
        .getViewFieldList()
        .map((field) => field.name);

      _log.info(store$.viewConfigManager.viewConfig.viewName.get());
      store$.displayOptions.viewField.allFields.set(viewFields);
    });

    setTimeout(() => {
      store$.state.set('initialized');
    }, 10);
  };

const handlingFetchMoreState = async (
  store$: Observable<LegendStore>,
  queryReturn: QueryReturnType
) => {
  const newData = queryReturn.data ?? [];
  const prevData = store$.dataModel.get().rows.map((row) => row.raw);

  const all = [...prevData, ...newData];

  const allIds = queryReturn.allIds;
  const toShow = allIds
    .map((id) => {
      const row = all.find((r) => r['id'] === id);
      if (!row) return null;
      return row;
    })
    .filter((row) => row !== null);
  store$.createDataModel(toShow);

  // store$.createDataModel(all);

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
  const allIds = queryReturn.allIds ?? [];

  const all = [...newData].filter((row) => {
    return allIds?.some((id) => id === row['id']);
  });

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
  const allIds = queryReturn.allIds ?? [];

  const all = [...newData].filter((row) => {
    return allIds?.some((id) => id === row['id']);
  });

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
  const prevIds = prevData.map((row) => row['id']);
  const _new = prevData
    .filter((row) => {
      return ids?.some((id) => id === row['id']);
    })
    .map((row) => {
      const newRow = newData.find((r) => r['id'] === row['id']) as typeof row;
      if (!newRow) return row;
      else return newRow;
    });

  const newEntries =
    newData.filter((row) => {
      return !prevIds?.some((id) => id === row['id']);
    }) ?? [];

  store$.createDataModel([..._new, ...newEntries]);

  store$.fetchMore.assign({
    currentCursor: store$.fetchMore.currentCursor.get(),
    nextCursor: queryReturn.continueCursor,
    isDone: queryReturn.isDone ?? false,
  });

  store$.state.set('initialized');
};

export const handleIncomingData: StoreFn<'handleIncomingData'> =
  (store$) => async (data) => {
    const state = store$.state.get();

    _log.info(`:handleIncomingData`, state, data);
    if (data.isPending) return;

    if (store$.viewConfigManager.localModeEnabled.get()) {
      _log.debug(`handleIncomingData:debugMode-> Update Data Model`);
      store$.createDataModel(data.data ?? []);

      return;
    }

    store$.createRelationalDataModel(data.relationalData ?? {});

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
        handleMutatingState(store$, data);
        break;

      default:
        break;
    }
  };

export const handleIncomingRelationalData: StoreFn<'handleIncomingData'> =
  (store$) => async (data) => {
    const relationalDataModel = Object.entries(
      data.relationalData ?? {}
    ).reduce((acc, [tableName, data]) => {
      const viewConfig = getViewByName(store$.views.get(), tableName);
      if (!viewConfig) return acc;

      const _data = makeData(store$.views.get(), viewConfig?.viewName)(data);

      acc[tableName] = _data;
      return acc;
    }, {} as RelationalDataModel);

    store$.relationalDataModel.set((prev) => ({
      ...prev,
      ...relationalDataModel,
    }));
  };

export const handleIncomingDetailData: StoreFn<'handleIncomingDetailData'> =
  (store$) => async (data) => {
    const rows = data.data;
    _log.debug('handleIncomingDetailData', rows);

    const tableName = store$.viewConfigManager.get().getTableName?.();
    if (rows?.length === 1) {
      const data = makeData(store$.views.get(), tableName)(rows);

      store$.detail.detailRow.set(data.rows?.[0]);
    }
  };
