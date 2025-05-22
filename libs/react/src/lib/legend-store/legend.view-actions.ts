import {
  BaseViewConfigManager,
  configManager,
  DEFAULT_FETCH_LIMIT_QUERY,
  patchAllViews,
  QueryReturnOrUndefined,
  RegisteredViews,
  UserViewData,
  ViewRegistryEntry,
} from '@apps-next/core';
import { batch, observable } from '@legendapp/state';
import { detailFormHelper } from './legend.detailpage.helper';
import { xSelect } from './legend.select-state';
import { getUserView, getView } from './legend.shared.derived';
import { store$ } from './legend.store';
import {
  createDataModel,
  createRelationalDataModel,
  handleIncomingDetailData,
} from './legend.store.fn.global';
import { getSubUserView } from './legend.utils';
import { perstistedStore$ } from './legend.store.persisted';

type Action =
  | {
      type: 'LOAD_VIEW';
      // viewName: string;
      userViewData: UserViewData | undefined | null;
      viewData: ViewRegistryEntry;
      data: QueryReturnOrUndefined;
      // id?: string | null | undefined;
      // isLoader?: boolean;
    }
  | {
      type: 'LOAD_DETAIL_OVERVIEW';
      data: QueryReturnOrUndefined;
      userViewData: UserViewData | undefined | null;
      viewData: ViewRegistryEntry;
      id: string;
    }
  | {
      type: 'LOAD_DETAIL_SUB_VIEW';
      parentViewName: string;
      data: QueryReturnOrUndefined;
      userViewData: UserViewData | undefined | null;
      viewData: ViewRegistryEntry;
      id: string;
    };

export const dispatchViewAction = (action: Action) => {
  switch (action.type) {
    case 'LOAD_VIEW':
      handleLoadView(action);
      break;
    case 'LOAD_DETAIL_OVERVIEW':
      handleLoadDetailOverview(action);
      break;
    case 'LOAD_DETAIL_SUB_VIEW':
      handleLoadDetailSubView(action);
      break;
    default:
      throw new Error(`Unknown action type: ${action}`);
  }
};

const handleLoadDetailSubView = (action: Action) => {
  if (action.type !== 'LOAD_DETAIL_SUB_VIEW') return;

  console.debug('ACTION: LOAD_DETAIL_SUB_VIEW:: ', action);

  store$.state.set('pending');

  const view = getView(action.viewData.viewConfig.viewName);

  if (!view) throw new Error('NO VIEW !!');

  const viewConfigManager = new BaseViewConfigManager(
    view,
    action.viewData.uiViewConfig
  );

  const parentUserViewData = getUserView(action.parentViewName);
  const parentView = parentUserViewData
    ? getView(parentUserViewData.baseView)
    : getView(action.parentViewName);

  if (!parentView) throw new Error('NO PARENT VIEW !!');

  resetStore();

  console.debug({ action });

  setStore({
    viewConfigManager,
    parentViewName: action.parentViewName,
    userViewData: action.userViewData ?? undefined,
  });

  handleQueryData(action.data);

  store$.detail.viewType.set({
    type: 'model',
    model: action.viewData.viewConfig.tableName,
  });

  store$.state.set('initialized');
};

const handleLoadDetailOverview = (action: Action) => {
  if (action.type !== 'LOAD_DETAIL_OVERVIEW') return;

  store$.state.set('pending');
  console.debug('ACTION: LOAD_DETAIL_OVERVIEW:: ', action);

  const view = getView(action.viewData.viewConfig.viewName);
  if (!view) throw new Error('handleLoadDetailOverview: View not found.');

  const viewConfigManager = new BaseViewConfigManager(
    view,
    action.viewData.uiViewConfig
  );

  batch(() => {
    //   !action.model &&
    resetStore();

    store$.detail.viewConfigManager.set(viewConfigManager);
    store$.detail.historyDataOfRow.set(action.data?.historyData ?? []);
    store$.detail.viewType.set({ type: 'overview' });
    store$.detail.parentViewName.set(
      action.userViewData?.name ?? action.viewData.viewConfig.viewName
    );
    createRelationalDataModel(store$)(action.data.relationalData ?? {});
    handleIncomingDetailData(store$)(action.data);
  });

  store$.state.set('initialized');
};

const handleLoadView = (action: Action) => {
  if (action.type !== 'LOAD_VIEW') return;
  console.debug('ACTION: LOAD_VIEW:: ', action.viewData.viewConfig.viewName);

  store$.state.set('pending');

  const { viewData, userViewData, data } = action;

  const view = getView(viewData.viewConfig.viewName);

  if (!view) throw new Error('handleLoadView: ERROR NO VIEW');

  const viewConfigManager = new BaseViewConfigManager(
    view,
    action.viewData.uiViewConfig
  );

  resetStore();

  setStore({
    viewConfigManager,
    parentViewName: undefined,
    userViewData,
  });

  // must be resetted after setStore and reset
  store$.detail.set(undefined);

  handleQueryData(data);

  store$.state.set('initialized');
};

const resetStore = () => {
  store$.state.set('pending');

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

  store$.detail.activeTabField.set(null);

  perstistedStore$.activeTabFieldName.set(undefined);
  perstistedStore$.isActivityTab.set(true);

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

const handleQueryData = (data: QueryReturnOrUndefined) => {
  if (!data?.data) return;

  const isDone = DEFAULT_FETCH_LIMIT_QUERY > (data.data?.length ?? 0);
  console.debug('____Receive Data: Length: ', data.data?.length, { isDone });
  store$.fetchMore.isDone.set(isDone);

  createDataModel(store$)(data.data ?? []);
  createRelationalDataModel(store$)(data.relationalData ?? {});
};

const setStore = ({
  viewConfigManager,
  userViewData,
  parentViewName,
}: {
  viewConfigManager: BaseViewConfigManager;
  userViewData: UserViewData | undefined | null;
  parentViewName: string | undefined;
}) => {
  batch(() => {
    const { filters, displayOptions } = configManager(
      viewConfigManager.viewConfig
    ).mergeAndCreate(userViewData);

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
};

export const viewActionStore = {
  dispatchViewAction,
  setViews: (views: RegisteredViews) => {
    store$.views.set(patchAllViews(views));
    if (!store$.viewConfigManager.viewConfig.get()) return;

    const current = store$.viewConfigManager.get();
    const viewConfig = getView(current.getViewName());
    if (!viewConfig) return;

    const updatedViewConfigManager = new BaseViewConfigManager(
      viewConfig,
      current.uiViewConfig
    );
    store$.viewConfigManager.set(updatedViewConfigManager);

    const currentDetail = store$.detail.viewConfigManager.get();
    if (currentDetail?.viewConfig.viewName) {
      const viewConfig = getView(currentDetail.viewConfig.viewName);
      if (!viewConfig) return;

      const updatedViewConfigManager = new BaseViewConfigManager(
        viewConfig,
        current.uiViewConfig
      );
      store$.detail.viewConfigManager.set(updatedViewConfigManager);
    }
  },
};
