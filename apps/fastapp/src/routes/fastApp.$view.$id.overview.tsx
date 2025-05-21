import {
  FormField,
  viewActionStore,
  RenderActivityList,
  makeHooks,
} from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import React from 'react';
import { getViewData } from '../application-store/app.store.utils';
import { getUserViews, getUserViewsQuery, queryClient } from '../query-client';
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
  const { makeDetailPageProps } = makeHooks();
  const { relationalListFields } = makeDetailPageProps();
  React.useEffect(() => console.debug('Render:DetailOverView'));

  const params = useViewParams();
  const viewName = params.viewName as string;

  const router = useRouter();
  const preloadRoute = router.preloadRoute;
  const preloadRef = React.useRef(preloadRoute);

  React.useEffect(() => {
    const firstRelationalListField = relationalListFields?.[0];
    if (!firstRelationalListField?.field?.name) return;
    console.debug('PRELOAD:SUB MODEL', firstRelationalListField.field?.name);

    preloadRef.current({
      from: '/fastApp/$view/$id/overview',
      to: '/fastApp/$view/$id/$model',
      params: {
        view: params.viewName,
        id: params.id,
        model: firstRelationalListField.field?.name,
      },
    });
  }, [params, relationalListFields]);

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
