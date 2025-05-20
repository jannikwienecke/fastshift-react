import { FormField, globalStore, RenderActivityList } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { getViewData } from '../application-store/app.store.utils';
import { getUserViews, getUserViewsQuery, queryClient } from '../query-client';
import { useViewParams } from '../shared/hooks';
import { getView } from '../shared/utils/app.helper';
import { DefaultDetailOverviewTemplate } from '../views/default-detail-view-template';

export const Route = createFileRoute('/fastApp/$view/$id/overview')({
  // onEnter: () => {
  //   console.log('/fastApp/view/$id/overview::onEnter');
  // },
  loader: async (props) => {
    await queryClient.ensureQueryData(getUserViewsQuery());

    await props.parentMatchPromise;

    const { viewData, userViewData, viewName } = getView(props);

    console.log('PRELOAD OVERVIEW!!');
    await props.context.preloadQuery(
      viewData.viewConfig,
      userViewData?.name ?? viewName,
      props.params.id,
      null,
      null
    );
    console.log('PRELOAD OVERVIEW!! DONE');
  },

  component: () => <DetaiViewPage />,
});

const DetaiViewPage = observer(() => {
  React.useEffect(() => console.log(':: Render:DetailOverView'));

  globalStore.dispatch({
    type: 'LOAD_SUB_VIEW_OVERVIEW_PAGE',
  });

  let { viewName } = useViewParams();
  viewName = viewName as string;

  const userViews = getUserViews();
  const { viewData } = getViewData(viewName, userViews);

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
