import { getViewByName, RecordType } from '@apps-next/core';
import { store$ } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';
import React from 'react';
import {
  dispatchLoadDetailOverviewView,
  dispatchLoadDetailSubView,
  dispatchLoadView,
  getViewData,
} from '../application-store/app.store.utils';
import { getUserViews, getUserViewsQuery, queryClient } from '../query-client';
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
    } else if (view) {
      await props.context.preloadQuery(
        viewData.viewConfig,
        userViewData?.name ?? viewName,
        null,
        null,
        null
      );
      dispatchLoadView(props, true);
    }
  },

  component: () => <ViewMainComponent />,
});

const ViewMainComponent = observer(() => {
  React.useEffect(() => console.debug('Render:ListPage'), []);
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

  if (!viewData) return null;
  return (
    <>
      {ViewComponent ? <ViewComponent /> : <DefaultViewTemplate />}
      <Outlet />
    </>
  );
});
