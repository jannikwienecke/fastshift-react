import { getViewByName, RecordType } from '@apps-next/core';
import { store$ } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import {
  createFileRoute,
  Outlet,
  useParams,
  useRouteContext,
} from '@tanstack/react-router';
import React from 'react';
import { loading$ } from '../application-store/app.store';
import {
  dispatchLoadDetailOverviewView,
  dispatchLoadDetailSubView,
  dispatchLoadView,
  getViewData,
} from '../application-store/app.store.utils';
import { getUserViewsQuery, queryClient } from '../query-client';
import { getView, getViewParms } from '../shared/utils/app.helper';
import { DefaultViewTemplate } from '../views/default-view-template';

export const Route = createFileRoute('/fastApp/$view')({
  loader: async (props) => {
    console.debug('/fastApp/view::loader');

    await queryClient.ensureQueryData(getUserViewsQuery());

    const { viewData, userViewData, viewName } = getView(props);

    const { id, view, model } = props.params as RecordType;

    if (id && view && model) {
      const { viewName: parentViewName } = getViewParms(props.params);
      if (!parentViewName) throw new Error('NOT VALID VIEW');
      const view = getViewByName(store$.views.get(), model);

      if (!view) throw new Error('NOT VALID MODEL VIEW');

      const { viewData } = getViewData(view.viewName);

      await props.context.preloadQuery(
        viewData.viewConfig,
        view.viewName,
        null,
        parentViewName,
        id
      );
      dispatchLoadDetailSubView(props, true);
      loading$.set(false);
    }

    if (id && view) {
      await props.context.preloadQuery(
        viewData.viewConfig,
        userViewData?.name ?? viewName,
        id,
        null,
        null
      );

      dispatchLoadDetailOverviewView(props, true);
      loading$.set(false);
    } else if (view) {
      props.cause !== 'preload' && loading$.set(true);
      await dispatchLoadView(props, true);
      loading$.set(false);
    }
  },

  component: () => <ViewMainComponent />,
});

const ViewMainComponent = observer(() => {
  React.useEffect(() => console.debug('Render:ListPage'), []);

  const params = useParams({ strict: false });
  const context = useRouteContext({ strict: false });

  const prevViewRef = React.useRef<string | null>(
    (params.view as string) + (params.id ?? '') + (params.model ?? '')
  );

  if (params.model) {
    dispatchLoadDetailSubView({ params, cause: '' });
    prevViewRef.current =
      params.view + (params.id ?? '') + (params.model ?? '');
  }
  if (params.id) {
    dispatchLoadDetailOverviewView({ params, cause: '' });
    prevViewRef.current =
      params.view + (params.id ?? '') + (params.model ?? '');
  } else if (
    !loading$.get() &&
    params.view + (params.id ?? '') + (params.model ?? '')
  ) {
    prevViewRef.current =
      params.view + (params.id ?? '') + (params.model ?? '');

    dispatchLoadView({
      params,
      cause: '',
      context,
    });
  }

  const { viewData } = getView({ params });
  const ViewComponent = viewData?.main;

  if (!viewData || loading$.get()) return null;
  return (
    <>
      {ViewComponent ? <ViewComponent /> : <DefaultViewTemplate />}
      <Outlet />
    </>
  );
});
