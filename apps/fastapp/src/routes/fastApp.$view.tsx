import { QueryReturnOrUndefined } from '@apps-next/core';
import { viewActionStore } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';
import React from 'react';
import { loading$ } from '../application-store/app.store';
import { getQueryKey, getUserViewsQuery, queryClient } from '../query-client';
import { getView } from '../shared/utils/app.helper';
import { DefaultViewTemplate } from '../views/default-view-template';

// const getQueryKey =

export const Route = createFileRoute('/fastApp/$view')({
  onEnter: async (props) => {
    await props.loaderPromise;
    await props.loadPromise;

    console.debug('onEnter:ListPage');
    const { viewData, userViewData, viewName } = getView(props);

    const data = queryClient.getQueryData(
      getQueryKey(viewData.viewConfig, viewName, null, null, null)
    ) as QueryReturnOrUndefined;

    console.log('onEnter:ListPage', props.params);
    if ((props.params as any)?.id) return;

    console.log('DISPATCH ACTION');
    viewActionStore.dispatchViewAction({
      type: 'LOAD_VIEW',
      viewData,
      userViewData,
      data,
    });
  },
  loader: async (props) => {
    await queryClient.ensureQueryData(getUserViewsQuery());

    console.debug('loader:ListPage');
    const { viewData, viewName } = getView(props);

    await props.context.preloadQuery?.(
      viewData.viewConfig,
      viewName,
      null,
      null,
      null
    );
  },

  component: () => <ViewMainComponent />,
});

const ViewMainComponent = observer(() => {
  React.useEffect(() => console.debug('Render:ListPage'), []);

  const params = useParams({ strict: false });

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
