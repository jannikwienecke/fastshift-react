import {
  _log,
  getViewByName,
  makeData,
  QueryReturnType,
  RelationalDataModel,
  RelationalFilterDataModel,
  sortRows,
} from '@apps-next/core';
import { batch, Observable } from '@legendapp/state';
import { ignoreNewData$ } from './legend.mutationts';
import { LegendStore, StoreFn } from './legend.store.types';
import { localModeEnabled$, setGlobalDataModel } from './legend.utils.helper';

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

    if (store$.state.get() !== 'invalidated') {
      setGlobalDataModel(dataModel.rows);
    }
  };

const handlingFetchMoreState = async (
  store$: Observable<LegendStore>,
  queryReturn: QueryReturnType
) => {
  const newData = queryReturn.data ?? [];
  const prevData = store$.dataModel.get().rows.map((row) => row.raw);

  const all = [...prevData, ...newData];

  const allIds = queryReturn.allIds;

  const addedIds = [] as string[];
  store$.createDataModel(
    all.filter((row) => {
      const isInAdded = addedIds.some((id) => id === row['id']);
      const isInAllIds = allIds?.some((id) => id === row['id']);

      if (isInAdded) {
        return false;
      }

      if (isInAllIds) {
        addedIds.push(row['id']);
      }

      return isInAllIds;
    })
  );

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
  if (ignoreNewData$.get() > 0) {
    ignoreNewData$.set((prev) => prev - 1);
    return;
  }

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

    if (data.isPending) return;

    store$.allIds.set(data.allIds ?? []);

    _log.debug(
      `____handleIncomingData`,
      state,
      data.data?.slice(0, 3).map((d) => d?.['name'])
    );

    if (
      localModeEnabled$.get() &&
      store$.detail.viewType.type.get() === 'model'
    ) {
      _log.debug(`handleIncomingData:debugMode-> Update Data Model`);
      store$.createDataModel(data.data ?? []);
      return;
    }

    // store$.createRelationalDataModel(data.relationalData ?? {});

    switch (state) {
      case 'invalidated':
        _log.debug('RECEIVING DATA AFTER INVALIDATED');
        setTimeout(() => store$.state.set('mutating'), 10);
        break;

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

    const viewName = store$.detail.viewConfigManager.getViewName();
    _log.debug('____handleIncomingDetailData: ', rows?.length, viewName);

    const key = `detail-${store$.detail.row.get()?.id}`;
    const ignoreNext = store$.ignoreNextQueryDict?.[key].get();
    const dirtyField = store$.detail.form.dirtyField.get();
    const diryValue = store$.detail.form.dirtyValue.get();

    if (ignoreNewData$.get() > 0) {
      ignoreNewData$.set((prev) => prev - 1);
      return;
    }

    store$.detail.historyDataOfRow.set(data.historyData);

    if (rows?.length === 1) {
      if (ignoreNext > 1) {
        store$.ignoreNextQueryDict[key].set(ignoreNext - 1);
      } else {
        if (!dirtyField || !diryValue) {
          const data = makeData(store$.views.get(), viewName)(rows);
          store$.detail.row.set({
            ...data.rows?.[0],
          });
        } else {
          const data = makeData(
            store$.views.get(),
            viewName
          )([
            {
              ...rows[0],
              [dirtyField.name]: diryValue,
            },
          ]);
          const row = data.rows?.[0];

          store$.detail.row.set(row);
        }
        store$.ignoreNextQueryDict[key].set(0);
      }
    }
  };

export const handleIncomingRelationalFilterData: StoreFn<
  'handleIncomingRelationalFilterData'
> = (store$) => async (data) => {
  const hasNoKeys = Object.keys(data).length === 0;
  if (hasNoKeys) return;

  const parsedData = Object.entries(data).reduce((acc, [tableName, data]) => {
    return {
      ...acc,
      [tableName]: data.map((item) => {
        const row = makeData(store$.views.get(), tableName)([item.record])
          .rows?.[0];
        row.raw = { ...row.raw, count: item.count };
        return row;
      }),
    };
  }, {} satisfies RelationalFilterDataModel);

  store$.relationalFilterData.set(parsedData);
};
