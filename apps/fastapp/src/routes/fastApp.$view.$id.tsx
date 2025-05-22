import { _log, QueryReturnOrUndefined, Row } from '@apps-next/core';
import { FormField, RenderDetailComplexValue, store$ } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import React from 'react';
import { getView } from '../shared/utils/app.helper';
import { DefaultDetailViewTemplate } from '../views/default-detail-view-template';
import { observable } from '@legendapp/state';
import { getUserViewsQuery, queryClient } from '../query-client';
import { preloadQuery } from '@apps-next/convex-adapter-app';
import { api } from '@apps-next/convex';
import { isInDetailView$ } from '../application-store/app.store.utils';
import { CircleIcon } from 'lucide-react';

const loading$ = observable(false);
const loadingEnter$ = observable(false);

export const Route = createFileRoute('/fastApp/$view/$id')({
  onLeave: () => {
    isInDetailView$.set(false);
  },
  onEnter: async (props) => {
    isInDetailView$.set(true);
    if ((props.params as any)?.model) return;
    loadingEnter$.set(true);

    await props.loaderPromise;
    await props.loadPromise;
    await queryClient.ensureQueryData(getUserViewsQuery());

    console.debug(':::onEnter:ID Page');
    const { viewData, userViewData } = getView(props);

    (await queryClient.ensureQueryData(
      preloadQuery(
        api.query.viewLoader,
        viewData.viewConfig,
        userViewData ?? null,
        props.params.id as string,
        null,
        null
      )
    )) as QueryReturnOrUndefined;
    loadingEnter$.set(false);
  },
  loader: async (props) => {
    props.cause !== 'preload' && isInDetailView$.set(true);

    console.debug(':::ONLOAD:ID Page', props.cause);
    if (props.cause === 'enter') {
      loading$.set(true);
    }
    await queryClient.ensureQueryData(getUserViewsQuery());

    await props.parentMatchPromise;

    const id = props.params.id as string;

    const { viewData, userViewData, viewName } = getView(props);

    await props.context.preloadQuery?.(
      viewData.viewConfig,
      userViewData?.name ?? viewName,
      id,
      null,
      null
    );

    if (props.cause === 'enter') {
      loading$.set(false);
    }
  },
  component: () => <DetaiViewPage />,
});

const DetaiViewPage = observer(() => {
  React.useEffect(() => console.debug('::Render:DetaiViewPage'), []);

  const params = useParams({ strict: false });
  const { viewData, viewName } = getView({ params });

  if (!viewData.viewConfig) {
    _log.info(`View ${viewName} not found, redirecting to /fastApp`);
    return null;
  }

  const row = store$.detail.row.get() as Row | undefined;
  const viewConfigManager = store$.detail.viewConfigManager.get();

  if (loading$.get() || loadingEnter$.get())
    return (
      <>
        <CircleIcon />
      </>
    );
  if (!store$.detail) return <>NO DETAIL</>;
  if (!row || !viewConfigManager) return <>NO ROW OR NO VIEW</>;

  if (viewData.detail) {
    return <viewData.detail />;
  }

  return (
    <DefaultDetailViewTemplate
      formField={FormField}
      complexFormField={RenderDetailComplexValue}
      detailOptions={{}}
    />
  );
});
