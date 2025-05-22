import { api } from '@apps-next/convex';
import { preloadQuery } from '@apps-next/convex-adapter-app';
import { QueryReturnOrUndefined } from '@apps-next/core';
import { store$, viewActionStore } from '@apps-next/react';
import { observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';
import React from 'react';
import { getUserViewsQuery, queryClient } from '../query-client';
import { getView } from '../shared/utils/app.helper';
import { DefaultViewTemplate } from '../views/default-view-template';

// const getQueryKey =

const loading$ = observable(false);
export const Route = createFileRoute('/fastApp/$view')({
  // gcTime: 0,
  // preloadGcTime: 1000 * 60 * 5, // 10 minutes
  onEnter: async (props) => {
    await props.loaderPromise;
    await props.loadPromise;

    store$.detail.set(undefined);
    console.debug('onEnter:ListPage:', props.params.view);
    const { viewData, userViewData } = getView(props);

    const data = (await queryClient.ensureQueryData(
      preloadQuery(
        api.query.viewLoader,
        viewData.viewConfig,
        userViewData ?? null,
        null,
        null,
        null
      )
    )) as QueryReturnOrUndefined;

    if ((props.params as any)?.id) return;

    viewActionStore.dispatchViewAction({
      type: 'LOAD_VIEW',
      viewData,
      userViewData,
      data,
    });
  },
  loader: async (props) => {
    console.debug('onLoad:ListPage', props.params.view);
    if (props.cause === 'enter') {
      loading$.set(true);
    }
    await queryClient.ensureQueryData(getUserViewsQuery());

    const { viewData, viewName } = getView(props);

    const dataLoader = await props.context.preloadQuery?.(
      viewData.viewConfig,
      viewName,
      null,
      null,
      null
    );

    if (props.cause === 'enter') {
      loading$.set(false);
    }
    console.debug('onLoad:ListPage:Data', props.params.view, dataLoader);
  },

  component: () => <ViewMainComponent />,
});

const ViewMainComponent = observer(() => {
  React.useEffect(() => console.debug('Render:ListPage'), []);

  const params = useParams({ strict: false });

  const { viewData } = getView({ params });
  const ViewComponent = viewData?.main;

  if (loading$.get()) return null;
  if (!viewData || loading$.get()) return null;
  return (
    <>
      {ViewComponent ? <ViewComponent /> : <DefaultViewTemplate />}
      <Outlet />
    </>
  );
});
