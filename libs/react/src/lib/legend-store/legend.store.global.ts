import {
  BaseViewConfigManager,
  configManager,
  DEFAULT_FETCH_LIMIT_QUERY,
  getViewByName,
  patchAllViews,
  QueryReturnOrUndefined,
  RegisteredViews,
  slugHelper,
  UserViewData,
} from '@apps-next/core';
import { batch } from '@legendapp/state';
import { viewRegistry } from './legend.app.registry';
import { detailFormHelper } from './legend.detailpage.helper';
import { xSelect } from './legend.select-state';
import { store$ } from './legend.store';
import {
  createDataModel,
  createRelationalDataModel,
  handleIncomingDetailData,
} from './legend.store.fn.global';

export const getViewData = (viewName: string) => {
  const userViews = store$.userViews.get();
  const parentView = store$.detail.parentViewName.get();

  if (parentView) {
    const view = getViewByName(store$.views.get(), viewName);
    const parentModel =
      getViewByName(store$.views.get(), parentView ?? '')?.tableName ?? '';
    if (parentModel) {
      const name = `${parentModel}|${view?.tableName ?? ''}`;

      return userViews.find((view) => view.name === name);
    }
  } else {
    return userViews.find((view) => view.name === viewName);
  }
};

export const currentViewName = () =>
  store$.viewConfigManager.viewConfig.get()
    ? store$.viewConfigManager?.getViewName?.().toLowerCase()
    : '';

const createViewConfigManager = (viewName: string) => {
  const views = store$.views.get();

  const viewData = getViewData(viewName);

  const viewConfig = getViewByName(views, viewData?.baseView ?? viewName);

  if (!viewConfig) {
    console.warn('____', viewName, views);
    console.error('viewConfig is not defined::', viewName);
    throw new Error(`viewConfig is not defined: ${viewName}`);
  }

  const { uiViewConfig } =
    viewRegistry.getView(viewConfig?.viewName ?? viewName) ?? {};

  const viewConfigManager = new BaseViewConfigManager(
    {
      ...viewConfig,
    },
    uiViewConfig
  );

  return viewConfigManager;
};

const resetStore = () => {
  store$.userViewSettings.initialSettings.set(null);
  store$.userViewSettings.hasChanged.set(false);

  store$.contextMenuState.row.set(null);

  store$.filter.filters.set([]);

  xSelect.close();

  store$.filterClose();
  store$.comboboxClose();
  store$.commandbarClose();
  store$.commandformClose();
  store$.displayOptionsClose();
  store$.contextMenuClose();

  store$.fetchMore.assign({
    isDone: false,
    currentCursor: {
      position: null,
      cursor: null,
    },
    nextCursor: {
      position: null,
      cursor: null,
    },
  });
};

const setStore = (viewName: string, parentViewName?: string) => {
  store$.state.set('pending');

  const userViewData = getViewData(viewName);
  const viewConfigManager = createViewConfigManager(viewName);

  const { filters, displayOptions } = configManager(
    viewConfigManager.viewConfig
  ).mergeAndCreate(userViewData);

  batch(() => {
    store$.viewConfigManager.set(viewConfigManager);
    store$.uiViewConfig.set(viewConfigManager.uiViewConfig);
    store$.userViewData.set(userViewData);
    store$.detail.parentViewName.set(parentViewName);

    const viewFields = viewConfigManager
      .getViewFieldList()
      .map((field) => field.name);

    store$.displayOptions.set({
      ...displayOptions,
      viewField: {
        allFields: viewFields,
        visible: displayOptions?.viewField?.visible ?? viewFields,
      },
      resetted: true,
    });
    store$.filter.filters.set(filters);

    const copyOfDisplayOptions = JSON.parse(
      JSON.stringify({
        ...displayOptions,
        viewField: {
          allFields: viewFields,
          visible: displayOptions?.viewField?.visible ?? viewFields,
        },
      })
    );
    const copyOfFilters = JSON.parse(JSON.stringify(filters));

    store$.displayOptions.softDeleteEnabled.set(
      !!viewConfigManager.viewConfig.mutation?.softDelete
    );

    if (!parentViewName) {
      store$.userViewSettings.initialSettings.set({
        filters: copyOfFilters,
        displayOptions: copyOfDisplayOptions,
      });
    }
  });

  store$.state.set('initialized');
};

const handleQueryData = (data: QueryReturnOrUndefined) => {
  const isDone = DEFAULT_FETCH_LIMIT_QUERY > (data.data?.length ?? 0);
  console.warn('____Receive Data: Length: ', data.data?.length, { isDone });
  store$.fetchMore.isDone.set(isDone);

  createDataModel(store$)(data.data ?? []);
  createRelationalDataModel(store$)(data.relationalData ?? {});
};

type GlobalStoreAction =
  | {
      type: 'INIT_LOAD_STORE';
      payload: {
        id: string | null;
        model: string | null;
        viewName: string;
        data: QueryReturnOrUndefined;
        views: RegisteredViews;
        userViews: UserViewData[];
        userView: UserViewData | null | undefined;
      };
    }
  | {
      type: 'CHANGE_VIEW';
      payload: {
        viewName: string;
        resetDetail?: boolean;
        data: QueryReturnOrUndefined;
      };
    }
  | {
      type: 'LOAD_VIEW_DETAIL_PAGE';
      payload: {
        viewName: string;
        id: string;
        data: QueryReturnOrUndefined;
      };
    }
  | {
      type: 'LOAD_SUB_VIEW_LIST_PAGE';
      payload: {
        viewName: string;
        parentViewName: string;
        id: string;
        data: QueryReturnOrUndefined | null;
      };
    }
  | {
      type: 'UNLOAD_VIEW_DETAIL_PAGE';
    };

const dispatch = (action: GlobalStoreAction) => {
  switch (action.type) {
    case 'INIT_LOAD_STORE':
      return handleInitLoadStore(action);

    case 'CHANGE_VIEW':
      return handleChangeView(action);
    case 'LOAD_SUB_VIEW_LIST_PAGE':
      return handleLoadSubViewListPage(action);
    case 'LOAD_VIEW_DETAIL_PAGE':
      return handleLoadDetailPage(action);

    default:
      console.warn('Unknown action type', action);
      throw new Error('Unknown action type');
  }
};

const handleInitLoadStore = (action: GlobalStoreAction) => {
  if (action.type !== 'INIT_LOAD_STORE') return;

  console.debug('____INIT LOAD STORE', action);
  const { viewName, data, userViews, views, userView } = action.payload;

  resetStore();
  store$.userViews.set(userViews);
  store$.views.set(patchAllViews(views));

  setStore(userView?.name ?? viewName);
  handleQueryData(data);
};

const handleChangeView = (action: GlobalStoreAction) => {
  console.debug('____HANDLE CHANGE VIEW', action.type);
  if (action.type !== 'CHANGE_VIEW') return;
  const { viewName, data, resetDetail } = action.payload;

  if (viewName !== currentViewName()) {
    store$.detail.set(undefined);
    resetStore();
    setStore(viewName);
    handleQueryData(data);
  } else if (resetDetail) {
    store$.detail.set(undefined);
    resetStore();
    setStore(viewName);
    handleQueryData(data);
  } else if (viewName === currentViewName()) {
    return;
  } else {
    throw new Error(`This should not happen: ${viewName}`);
  }
};

const handleLoadDetailPage = (action: GlobalStoreAction) => {
  if (action.type !== 'LOAD_VIEW_DETAIL_PAGE') return;

  const { viewName, id, data } = action.payload;
  if (id === store$.detail.row.id.get()) return;

  console.warn('____LOAD VIEW DETAIL PAGE', action);

  const viewConfigManager = createViewConfigManager(viewName);

  store$.detail.viewConfigManager.set(viewConfigManager);

  batch(() => {
    store$.detail.viewType.set({ type: 'overview' });
    store$.detail.parentViewName.set(viewName);
    handleIncomingDetailData(store$)(data);
  });

  const helper = detailFormHelper();

  const firstRelationalListField = helper.getRelationalFields()?.[0];
  const viewConfigOfFirstRelationalListField = getViewByName(
    store$.views.get(),
    firstRelationalListField?.field.name ?? ''
  );

  if (!viewConfigOfFirstRelationalListField) return;

  // setTimeout(() => {
  handleLoadSubViewListPage({
    type: 'LOAD_SUB_VIEW_LIST_PAGE',
    payload: {
      data: null,
      id: action.payload.id,
      viewName: firstRelationalListField?.field.name ?? '',
      parentViewName: action.payload.viewName,
    },
  });

  // }, 100);
};

const handleLoadSubViewListPage = (action: GlobalStoreAction) => {
  if (action.type !== 'LOAD_SUB_VIEW_LIST_PAGE') return;

  const { viewName, id, data } = action.payload;
  const parentViewName = slugHelper().unslugify(action.payload.parentViewName);

  const currentId = store$.detail.row.id.get();
  const currentParentViewName = store$.detail.parentViewName.get();
  const currentViewName = store$.viewConfigManager.getViewName();

  if (
    currentId === id &&
    currentParentViewName === parentViewName &&
    currentViewName === viewName &&
    data
  ) {
    handleQueryData(data);
  } else {
    console.warn('____LOAD SUB VIEW LIST PAGE', action);
    resetStore();

    setStore(viewName, parentViewName);

    if (data) {
      handleQueryData(data);
    }
  }

  data &&
    store$.detail.viewType.set({
      type: 'model',
      model: store$.viewConfigManager.getTableName(),
    });
};

export const globalStore = {
  dispatch,
  setViews: (views: RegisteredViews) => {
    store$.views.set(patchAllViews(views));
  },
};
