import {
  _log,
  getViewByName,
  QueryReturnOrUndefined,
  Row,
} from '@apps-next/core';
import {
  FormField,
  globalStore,
  RenderDetailComplexValue,
  store$,
} from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, redirect, useParams } from '@tanstack/react-router';
import React from 'react';
import { getViewData, wait } from '../application-store/app.store.utils';
import {
  getQueryKey,
  getUserViewQuery,
  getUserViews,
  getUserViewsQuery,
  queryClient,
} from '../query-client';
import { useViewParams } from '../shared/hooks';
import { getViewParms, pachTheViews } from '../shared/utils/app.helper';
import { DefaultDetailViewTemplate } from '../views/default-detail-view-template';

export const Route = createFileRoute('/fastApp/$view/$id')({
  loader: async (props) => {
    await wait();

    await queryClient.ensureQueryData(getUserViewsQuery());

    const { id, viewName } = getViewParms(props.params);
    if (!viewName) return;

    if (!id) throw new Error('ID is required');

    await queryClient.ensureQueryData(getUserViewQuery(viewName));

    const userViews = getUserViews();
    const { viewData } = getViewData(viewName, userViews);

    await props.context.preloadQuery(
      viewData.viewConfig,
      viewName,
      id,
      null,
      null
    );
  },
  component: () => <DetaiViewPage />,
});

const DetaiViewPage = observer(() => {
  const { id } = useParams({ from: '/fastApp/$view/$id' });

  let { viewName } = useViewParams();
  viewName = viewName as string;

  const userViews = getUserViews();
  const { viewData } = getViewData(viewName, userViews);

  const view = getViewByName(pachTheViews(), viewName);

  const doOnceForId = React.useRef('');

  if (id && id !== doOnceForId.current) {
    doOnceForId.current = id;

    const queryKey = getQueryKey(viewData.viewConfig, viewName, id, null, null);
    const detailQueryData = queryClient.getQueryData(
      queryKey
    ) as QueryReturnOrUndefined;

    globalStore.dispatch({
      type: 'LOAD_VIEW_DETAIL_PAGE',
      payload: { id, viewName, data: detailQueryData },
    });
  }

  if (!view) {
    _log.info(`View ${viewName} not found, redirecting to /fastApp`);
    throw redirect({ to: `/fastApp/${viewName}` });
  }

  const row = store$.detail.row.get() as Row;
  if (!row) {
    return <div>No data found</div>;
  }

  if (viewData.detail) {
    return <viewData.detail row={row} />;
  }

  return (
    <DefaultDetailViewTemplate
      formField={FormField}
      complexFormField={RenderDetailComplexValue}
      detailOptions={{ row }}
    />
  );
});
