import { FormField, RenderActivityList } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { getViewData } from '../application-store/app.store.utils';
import { getUserViewsQuery, queryClient } from '../query-client';
import { useViewParams } from '../shared/hooks';
import { getView } from '../shared/utils/app.helper';
import { DefaultDetailOverviewTemplate } from '../views/default-detail-view-template';

export const Route = createFileRoute('/fastApp/$view/$id/overview')({
  loader: async (props) => {
    await queryClient.ensureQueryData(getUserViewsQuery());

    await props.parentMatchPromise;

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
  React.useEffect(() => console.debug('Render:DetailOverView'));

  let { viewName } = useViewParams();
  viewName = viewName as string;

  const { viewData } = getViewData(viewName);

  if (viewData.overView) {
    return <viewData.overView />;
  }

  return (
    <DefaultDetailOverviewTemplate
      activityList={RenderActivityList}
      detailOptions={{}}
      FormField={FormField}
    />
  );
});
