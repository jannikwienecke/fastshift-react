import { views } from '@apps-next/convex';
import {
  getViewByName,
  QueryReturnOrUndefined,
  RecordType,
  UserViewData,
  ViewRegistryEntry,
} from '@apps-next/core';
import {
  viewActionStore,
  viewRegistry,
  getSubUserView,
  store$,
} from '@apps-next/react';
import { getQueryKey, getUserViews, queryClient } from '../query-client';
import { getView } from '../shared/utils/app.helper';
import { ConvexPreloadQuery } from '@apps-next/convex-adapter-app';

export const isDev = import.meta.env.MODE === 'development';
export const wait = () => {
  if (!isDev) {
    console.warn('wait() is only for development purposes');
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 0);
  });
};

export const getViewData = (
  viewName: string
): {
  userViewData: UserViewData | null | undefined;
  viewData: ViewRegistryEntry;
} => {
  const userViewData = store$.userViews
    .get()
    .find((view) => view.name === viewName);

  const viewData = viewRegistry.getView(userViewData?.baseView ?? viewName);

  return { viewData, userViewData };
};

export const getSubModelViewData = (model: string, parentModel: string) => {
  // const model = ctx.params.model;
  const modelView = getViewByName(views, model);

  if (!modelView) throw new Error('NOT VALID MODEL');

  const { viewData } = getViewData(modelView.viewName);

  const userViewData = getSubUserView(modelView);

  return { viewData, userViewData };
};

export const dispatchLoadView = async (
  props: {
    params: RecordType;
    cause: string;
    context: {
      preloadQuery?: ConvexPreloadQuery<QueryReturnOrUndefined>;
    };
  },

  isLoader?: boolean
) => {
  const { viewData, userViewData, viewName } = getView(props);

  const data = await props.context.preloadQuery?.(
    viewData.viewConfig,
    viewName,
    null,
    null,
    null
  );

  if (props.cause === 'preload' || props.params?.id) {
    return {};
  }

  if (!data) throw new Error('NOT VALID PRELOAD QUERY');

  viewActionStore.dispatchViewAction({
    type: 'LOAD_VIEW',
    viewName,
    data,
    userViewData,
    viewData,
    isLoader,
  });
  return { viewData, userViewData, viewName };
};

export const dispatchLoadDetailOverviewView = async (
  props: {
    params: RecordType;
    cause: string;
    context: {
      preloadQuery?: ConvexPreloadQuery<QueryReturnOrUndefined>;
    };
  },
  isLoader?: boolean
) => {
  const id = props.params.id as string;
  const model = props.params.model as string | undefined;

  const { viewData, userViewData, viewName } = getView(props);

  setTimeout(() => {
    // also preload the parent view
    props.context.preloadQuery?.(
      viewData.viewConfig,
      userViewData?.name ?? viewName,
      null,
      null,
      null
    );
  }, 500);

  const data = await props.context.preloadQuery?.(
    viewData.viewConfig,
    userViewData?.name ?? viewName,
    id,
    null,
    null
  );

  if (props.cause === 'preload') {
    return {};
  }

  if (!data) throw new Error('NOT VALID PRELOAD QUERY');

  viewActionStore.dispatchViewAction({
    type: 'LOAD_DETAIL_OVERVIEW',
    viewName,
    data,
    userViewData,
    viewData,
    model,
    id,
    isLoader,
  });
  return { viewData, userViewData, viewName };
};

export const dispatchLoadDetailSubView = async (
  props: {
    params: RecordType;
    cause: string;
    context: {
      preloadQuery?: ConvexPreloadQuery<QueryReturnOrUndefined>;
    };
  },
  isLoader?: boolean
) => {
  const id = props.params.id as string;
  const model = props.params.model as string;

  const { viewData: parentViewData, viewName: parentViewName } = getView(props);

  const { viewData: viewDataModel } = getSubModelViewData(
    model,
    parentViewData.viewConfig.tableName
  );

  const modelView = viewDataModel.viewConfig;

  if (!modelView) throw new Error('NOT VALID MODEL VIEW');

  const userViews = getUserViews();

  const { viewData: modelViewData } = getViewData(modelView.viewName);

  const name = `${parentViewData.viewConfig.tableName}|${modelView.tableName}`;
  const userViewData = userViews.find((u) => u.name === name);

  setTimeout(() => {
    // also preload the parent view
    props.context.preloadQuery?.(
      parentViewData.viewConfig,
      parentViewData.viewConfig.viewName,
      null,
      null,
      null
    );
  }, 500);

  const data = await props.context.preloadQuery?.(
    modelView,
    modelView.viewName,
    null,
    parentViewName,
    id
  );

  if (props.cause === 'preload') return {};

  if (!data) throw new Error('NOT VALID PRELOAD QUERY');

  viewActionStore.dispatchViewAction({
    type: 'LOAD_DETAIL_SUB_VIEW',
    viewName: modelView.viewName,
    parentViewName: parentViewName,
    data,
    userViewData,
    viewData: modelViewData,
    id,
    isLoader,
  });
  return { viewData: modelViewData, userViewData, viewName: parentViewName };
};
