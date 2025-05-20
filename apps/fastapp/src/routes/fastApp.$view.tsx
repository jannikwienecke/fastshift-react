import {
  getViewByName,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';
import { dispatch, store$ } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';
import React from 'react';
import {
  getQueryKey,
  getUserViews,
  getUserViewsQuery,
  queryClient,
} from '../query-client';
import { getView, getViewParms } from '../shared/utils/app.helper';
import { DefaultViewTemplate } from '../views/default-view-template';
import { getViewData } from '../application-store/app.store.utils';

export const dispatchLoadView = (props: {
  params: RecordType;
  cause: string;
}) => {
  if (props.cause === 'preload' || props.params?.id) return {};

  const { viewData, userViewData, viewName } = getView(props);

  const data = queryClient.getQueryData(
    getQueryKey(
      viewData.viewConfig,
      userViewData?.name ?? viewName,
      null,
      null,
      null
    )
  ) as QueryReturnOrUndefined;

  dispatch({ type: 'LOAD_VIEW', viewName, data, userViewData, viewData });
  return { viewData, userViewData, viewName };
};

export const dispatchLoadDetailOverviewView = (props: {
  params: RecordType;
  cause: string;
}) => {
  const id = props.params.id as string;
  const model = props.params.model as string | undefined;
  if (props.cause === 'preload') return {};

  const { viewData, userViewData, viewName } = getView(props);

  const data = queryClient.getQueryData(
    getQueryKey(
      viewData.viewConfig,
      userViewData?.name ?? viewName,
      id,
      null,
      null
    )
  ) as QueryReturnOrUndefined;

  dispatch({
    type: 'LOAD_DETAIL_OVERVIEW',
    viewName,
    data,
    userViewData,
    viewData,
    model,
    id,
  });
  return { viewData, userViewData, viewName };
};

export const dispatchLoadDetailSubView = (props: {
  params: RecordType;
  cause: string;
}) => {
  const id = props.params.id as string;
  const model = props.params.model as string;
  if (props.cause === 'preload') return {};

  const { viewName, viewData } = getView(props);

  const modelView = getViewByName(store$.views.get(), model);
  if (!modelView) throw new Error('NOT VALID MODEL VIEW');

  const userViews = getUserViews();

  const { viewData: modelViewData } = getViewData(
    modelView.viewName,
    userViews
  );

  const name = `${viewData.viewConfig.tableName}|${modelView.tableName}`;
  const userViewData = userViews.find((u) => u.name === name);

  const data = queryClient.getQueryData(
    getQueryKey(
      modelViewData.viewConfig,
      modelView.viewName,
      null,
      viewName ?? null,
      id ?? null
    )
  ) as QueryReturnOrUndefined;

  dispatch({
    type: 'LOAD_DETAIL_SUB_VIEW',
    viewName: modelView.viewName,
    parentViewName: viewName,
    data,
    userViewData,
    viewData: modelViewData,
    id,
  });
  return { viewData: modelViewData, userViewData, viewName };
};

export const Route = createFileRoute('/fastApp/$view')({
  // onEnter: async (props) => {
  //   console.log('/fastApp/view::onEnter');
  // },

  loader: async (props) => {
    console.log('/fastApp/view::loader');

    await queryClient.ensureQueryData(getUserViewsQuery());

    const { viewData, userViewData, viewName } = getView(props);

    const { id, view, model } = props.params as RecordType;

    console.log({ id, view, model });

    if (id && view && model) {
      console.log('LOAD SUB MODEL');
      const { viewName: parentViewName } = getViewParms(props.params);
      if (!parentViewName) throw new Error('NOT VALID VIEW');
      const view = getViewByName(store$.views.get(), model);
      const userViews = getUserViews();
      if (!view) throw new Error('NOT VALID MODEL VIEW');

      const { viewData } = getViewData(view.viewName, userViews);

      await props.context.preloadQuery(
        viewData.viewConfig,
        view.viewName,
        null,
        parentViewName,
        id
      );
      dispatchLoadDetailSubView(props);
    }

    if (id && view) {
      console.log('LOAD DETAIL OVERVIEW');
      await props.context.preloadQuery(
        viewData.viewConfig,
        userViewData?.name ?? viewName,
        id,
        null,
        null
      );

      dispatchLoadDetailOverviewView(props);
    } else if (view) {
      console.log('LOAD VIEW');
      await props.context.preloadQuery(
        viewData.viewConfig,
        userViewData?.name ?? viewName,
        null,
        null,
        null
      );
      dispatchLoadView(props);
    }
  },

  component: () => <ViewMainComponent />,
});

const ViewMainComponent = observer(() => {
  React.useEffect(() => console.log(':: Render:ListPage'), []);
  const params = useParams({ strict: false });

  if (params.model) {
    dispatchLoadDetailSubView({ params, cause: '' });
  }

  if (params.id) {
    dispatchLoadDetailOverviewView({ params, cause: '' });
  } else {
    dispatchLoadView({ params, cause: '' });
  }
  const { viewData } = getView({ params });
  const ViewComponent = viewData?.main;

  console.log(store$.viewConfigManager?.viewConfig?.get());

  if (!viewData) return null;
  return (
    <>
      {ViewComponent ? <ViewComponent /> : <DefaultViewTemplate />}
      <Outlet />
    </>
  );
});
