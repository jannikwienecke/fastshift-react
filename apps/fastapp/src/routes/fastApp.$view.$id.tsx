import { _log, Row } from '@apps-next/core';
import { FormField, RenderDetailComplexValue, store$ } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import React from 'react';
import { getView } from '../shared/utils/app.helper';
import { getUserViewsQuery, queryClient } from '../query-client';
import { DefaultDetailViewTemplate } from '@apps-next/shared';

export const Route = createFileRoute('/fastApp/$view/$id')({
  loader: async (props) => {
    await props.parentMatchPromise;
    await queryClient.ensureQueryData(getUserViewsQuery());
    const { viewData, userViewData, viewName } = getView(props);
    await props.context.preloadQuery(
      viewData.viewConfig,
      userViewData?.name ?? viewName,
      props.params.id,
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
    return <div aria-label="no view config"></div>;
  }

  const row = store$.detail.row.get() as Row | undefined;
  const viewConfigManager = store$.detail.viewConfigManager.get();

  if (!row || !viewConfigManager) {
    return <div aria-label="no data or viewconfigmanager"></div>;
  }

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
