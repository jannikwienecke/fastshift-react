import { _log, QueryReturnOrUndefined, Row } from '@apps-next/core';
import {
  FormField,
  RenderDetailComplexValue,
  store$,
  viewActionStore,
} from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import React from 'react';
import { getView } from '../shared/utils/app.helper';
import { DefaultDetailViewTemplate } from '../views/default-detail-view-template';
import { getUserViewsQuery, queryClient } from '../query-client';
import { api } from '@apps-next/convex';
import { preloadQuery } from '@apps-next/convex-adapter-app';
import { observable } from '@legendapp/state';

const loading$ = observable(false);
export const Route = createFileRoute('/fastApp/$view/$id')({
  onLeave: async (props) => {
    console.debug('::onLeave:DetailPage');
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

    viewActionStore.dispatchViewAction({
      type: 'LOAD_VIEW',
      viewData,
      userViewData,
      data,
    });
  },
  onEnter: async (props) => {
    await props.loaderPromise;
    await props.loadPromise;

    console.debug('::onEnter:Overview Page');
    const { viewData, userViewData } = getView(props);

    const id = props.params.id as string;

    const data = (await queryClient.ensureQueryData(
      preloadQuery(
        api.query.viewLoader,
        viewData.viewConfig,
        userViewData ?? null,
        id,
        null,
        null
      )
    )) as QueryReturnOrUndefined;

    viewActionStore.dispatchViewAction({
      type: 'LOAD_DETAIL_OVERVIEW',
      viewData,
      userViewData,
      data,
      id,
    });
  },
  loader: async (props) => {
    console.debug('::ONLOAD:Overview Page');
    if (props.cause === 'enter') {
      loading$.set(true);
    }
    await props.parentMatchPromise;
    await queryClient.ensureQueryData(getUserViewsQuery());

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

    console.debug('::onLOAD:DONE:Overview Page');
  },
  component: () => <DetaiViewPage />,
});

const DetaiViewPage = observer(() => {
  React.useEffect(() => console.debug('::Render:DetaiViewPage'), []);

  const params = useParams({ strict: false });
  const { viewData, viewName } = getView({ params });

  if (loading$.get()) return null;

  if (!viewData.viewConfig) {
    _log.info(`View ${viewName} not found, redirecting to /fastApp`);
    return null;
  }

  const row = store$.detail.row.get() as Row | undefined;
  const viewConfigManager = store$.detail.viewConfigManager.get();

  if (!row || !viewConfigManager) return <>NULL</>;

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
