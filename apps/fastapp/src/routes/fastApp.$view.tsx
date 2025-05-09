import { _log } from '@apps-next/core';
import { viewRegistry } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import { getViewData, wait } from '../application-store/app.store.utils';
import { getUserViews, getUserViewsQuery, queryClient } from '../query-client';
import { useViewParams } from '../shared/hooks';
import { getViewParms } from '../shared/utils/app.helper';
import { DefaultViewTemplate } from '../views/default-view-template';

export const Route = createFileRoute('/fastApp/$view')({
  loader: async (props) => {
    await wait();

    await queryClient.ensureQueryData(getUserViewsQuery());

    const { viewName } = getViewParms(props.params);

    if (!viewName) return;

    const userViews = getUserViews();

    const { viewData, userViewData } = getViewData(viewName, userViews);

    await props.context.preloadQuery(
      viewData.viewConfig,
      userViewData?.name ?? viewName,
      null,
      null,
      null
    );
  },

  component: () => <ViewMainComponent />,
});

const ViewMainComponent = observer(() => {
  _log.debug('Render ViewMainComponent');

  let { viewName } = useViewParams();
  viewName = viewName as string;

  const userViews = getUserViews();

  const { viewData } = getViewData(viewName, userViews);

  const ViewComponent = viewData.main;

  React.useEffect(() => {
    _log.debug('Render ViewMainComponent useEffect');
  }, []);

  if (!viewData) return null;
  return (
    <>
      {ViewComponent ? <ViewComponent /> : <DefaultViewTemplate />}
      <Outlet />
    </>
  );
});
