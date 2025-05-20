import {
  BaseViewConfigManager,
  configManager,
  DEFAULT_FETCH_LIMIT_QUERY,
  QueryReturnOrUndefined,
  UserViewData,
  ViewRegistryEntry,
} from '@apps-next/core';
import { batch, observable } from '@legendapp/state';
import { detailFormHelper } from './legend.detailpage.helper';
import { xSelect } from './legend.select-state';
import { getView } from './legend.shared.derived';
import { store$ } from './legend.store';
import {
  createDataModel,
  createRelationalDataModel,
  handleIncomingDetailData,
} from './legend.store.fn.global';

type Action =
  | {
      type: 'LOAD_VIEW';
      viewName: string;
      data: QueryReturnOrUndefined;
      userViewData: UserViewData | undefined | null;
      viewData: ViewRegistryEntry;
      id?: string | null | undefined;
    }
  | {
      type: 'LOAD_DETAIL_OVERVIEW';
      viewName: string;
      data: QueryReturnOrUndefined;
      userViewData: UserViewData | undefined | null;
      viewData: ViewRegistryEntry;
      id: string;
      model: string | undefined;
    }
  | {
      type: 'LOAD_DETAIL_SUB_VIEW';
      viewName: string;
      parentViewName: string;
      data: QueryReturnOrUndefined;
      userViewData: UserViewData | undefined | null;
      viewData: ViewRegistryEntry;
      id: string;
    };

export const state$ = observable({
  detailData: {} as QueryReturnOrUndefined,
});

export const dispatch = (action: Action) => {
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

const loadDetailSubViewKey$ = observable('');
const handleLoadDetailSubView = (action: Action) => {
  if (action.type !== 'LOAD_DETAIL_SUB_VIEW') return;
  const key = `load-view-${action.parentViewName}-${action.id}-model-${action.viewName}`;

  if (loadDetailSubViewKey$.get() === key) {
    return;
  }

  loadDetailSubViewKey$.set(key);

  console.log('ACTION: LOAD_DETAIL_SUB_VIEW:: ', action);

  const view = getView(action.viewData.viewConfig.viewName);
  if (!view) throw new Error('NO VIEW !!');
  const viewConfigManager = new BaseViewConfigManager(
    view,
    action.viewData.uiViewConfig
  );

  resetStore();

  setStore({
    viewConfigManager,
    parentViewName: action.parentViewName,
    userViewData: action.userViewData ?? undefined,
  });

  handleQueryData(action.data);

  store$.state.set('initialized');
};

const loadDetailOverviewKey$ = observable('');
const handleLoadDetailOverview = (action: Action) => {
  if (action.type !== 'LOAD_DETAIL_OVERVIEW') return;
  const key = `load-view-${action.viewName}-${action.id}-overview`;
  if (loadDetailOverviewKey$.get() === key) return;

  loadDetailOverviewKey$.set(key);
  loadViewKey$.set('');
  console.log('ACTION: LOAD_DETAIL_OVERVIEW:: ', action);

  const view = getView(action.viewData.viewConfig.viewName);

  if (!view) {
    throw new Error('NOT VALID VIEW');
  }

  const viewConfigManager = new BaseViewConfigManager(
    view,
    action.viewData.uiViewConfig
  );

  if (!action.model) {
    resetStore();

    batch(() => {
      store$.detail.viewConfigManager.set(viewConfigManager);
      store$.detail.historyDataOfRow.set(action.data.historyData ?? []);
      store$.detail.viewType.set(
        action.model
          ? {
              type: action.model ? 'model' : 'overview',
              model: action.model,
            }
          : { type: 'overview' }
      );
      store$.detail.parentViewName.set(action.viewName);
      createRelationalDataModel(store$)(action.data.relationalData ?? {});
      handleIncomingDetailData(store$)(action.data);
    });

    console.log('SET UP SUB VIEW FOR DETAIL OVERVIEW');
    // load sub view...
    const helper = detailFormHelper();

    const firstRelationalListField = helper.getRelationalFields()?.[0];

    if (!firstRelationalListField) return;

    const viewConfigOfFirstRelationalListField = getView(
      firstRelationalListField?.field.name ?? ''
    );

    if (!viewConfigOfFirstRelationalListField) return;

    const viewConfigManagerRelation = new BaseViewConfigManager(
      viewConfigOfFirstRelationalListField
    );

    setStore({
      viewConfigManager: viewConfigManagerRelation,
      // TODO: Use the userViewData of the sub model e.g.tasks|projects
      userViewData: undefined,
      parentViewName: action.viewName,
    });
    loadDetailSubViewKey$.set('');
  } else {
    batch(() => {
      store$.detail.viewConfigManager.set(viewConfigManager);
      store$.detail.historyDataOfRow.set(action.data.historyData ?? []);
      store$.detail.viewType.set(
        action.model
          ? {
              type: action.model ? 'model' : 'overview',
              model: action.model,
            }
          : { type: 'overview' }
      );
      store$.detail.parentViewName.set(action.viewName);
      createRelationalDataModel(store$)(action.data.relationalData ?? {});
      handleIncomingDetailData(store$)(action.data);
    });
  }
};

const loadViewKey$ = observable('');
const handleLoadView = (action: Action) => {
  if (action.type !== 'LOAD_VIEW') return;
  const key = `load-view-${action.viewName}`;

  const view = getView(action.viewData.viewConfig.viewName);
  if (!view) throw new Error('ERROR NO VIEW');

  const viewConfigManager = new BaseViewConfigManager(
    view,
    action.viewData.uiViewConfig
  );

  if (loadViewKey$.get() === key) return;

  console.log('ACTION: LOAD_VIEW:: ', action.viewName);
  resetStore();
  setStore({
    viewConfigManager,
    parentViewName: undefined,
    userViewData: action.userViewData ?? undefined,
  });

  if (!action.id) {
    loadDetailOverviewKey$.set('');
    loadDetailSubViewKey$.set('');
    store$.detail.set(undefined);
  }

  loadViewKey$.set(key);

  handleQueryData(action.data);

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
  userViewData: UserViewData | undefined;
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
