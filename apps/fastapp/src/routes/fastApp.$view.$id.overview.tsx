import { api } from '@apps-next/convex';
import { preloadQuery } from '@apps-next/convex-adapter-app';
import { QueryReturnOrUndefined, RecordType } from '@apps-next/core';
import {
  FormField,
  RenderActivityList,
  makeHooks,
  viewActionStore,
} from '@apps-next/react';
import { observable } from '@legendapp/state';
import { Memo, observer } from '@legendapp/state/react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import React from 'react';
import { getViewData } from '../application-store/app.store.utils';
import { getUserViewsQuery, queryClient } from '../query-client';
import { useViewParams } from '../shared/hooks';
import { getView } from '../shared/utils/app.helper';
import { DefaultDetailOverviewTemplate } from '../views/default-detail-view-template';

const loadingEnter$ = observable(false);
export const Route = createFileRoute('/fastApp/$view/$id/overview')({
  onEnter: async (props) => {
    if ((props.params as any)?.model) return;

    loadingEnter$.set(true);
    console.debug(':::onEnter:Overview Page');

    await queryClient.ensureQueryData(getUserViewsQuery());

    await props.loaderPromise;
    await props.loadPromise;

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
      model: (props.params as RecordType).model,
    });
    loadingEnter$.set(false);
  },

  component: () => <DetaiViewPage />,
});

const DetaiViewPage = observer(() => {
  React.useEffect(() => console.debug('Render:DetailOverView'));

  const params = useViewParams();
  const viewName = params.viewName as string;

  const { viewData } = getViewData(viewName);

  if (viewData.overView) {
    return <viewData.overView />;
  }

  return (
    <>
      <DefaultDetailOverviewTemplate
        activityList={RenderActivityList}
        detailOptions={{}}
        FormField={FormField}
      />
      <Memo>{() => <PreloadComponent />}</Memo>
    </>
  );
});

const PreloadComponent = observer(() => {
  const { makeDetailPageProps } = makeHooks();
  const { relationalListFields } = makeDetailPageProps();

  const params = useViewParams();

  const router = useRouter();
  const preloadRoute = router.preloadRoute;
  const preloadRef = React.useRef(preloadRoute);

  React.useEffect(() => {
    const firstRelationalListField = relationalListFields?.[0];
    if (!firstRelationalListField?.field?.name) return;
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

  return null;
});
