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
import { getQueryKey, getUserViewsQuery, queryClient } from '../query-client';

export const Route = createFileRoute('/fastApp/$view/$id')({
  onLeave: (props) => {
    console.debug('onLeave:DetailPage');
    const { viewData, userViewData, viewName } = getView(props);

    const data = queryClient.getQueryData(
      getQueryKey(viewData.viewConfig, viewName, null, null, null)
    ) as QueryReturnOrUndefined;

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

    console.debug('onEnter:Overview Page');
    const { viewData, userViewData, viewName } = getView(props);

    const id = props.params.id as string;
    const data = queryClient.getQueryData(
      getQueryKey(viewData.viewConfig, viewName, id, null, null)
    ) as QueryReturnOrUndefined;

    viewActionStore.dispatchViewAction({
      type: 'LOAD_DETAIL_OVERVIEW',
      viewData,
      userViewData,
      data,
      id,
    });
  },
  loader: async (props) => {
    console.debug('loader:Overview Page');
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
  },
  component: () => <DetaiViewPage />,
});

const DetaiViewPage = observer(() => {
  React.useEffect(() => console.debug('Render:DetaiViewPage'), []);

  const params = useParams({ strict: false });
  const { viewData, viewName } = getView({ params });

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
